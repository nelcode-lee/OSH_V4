#!/usr/bin/env python3
"""
Course Image Generation Script
Generates missing course and equipment images
"""

import os
import sys
import asyncio
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import io

# Add the app directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.image_generator import ImageManager, AIImageGenerator

def create_equipment_placeholder(filename: str, title: str, description: str):
    """Create a placeholder image for equipment"""
    
    # Create a 1024x1024 image
    width, height = 1024, 1024
    image = Image.new('RGB', (width, height), color='#1e40af')  # Blue background
    
    draw = ImageDraw.Draw(image)
    
    # Try to use a system font
    try:
        font_large = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 48)
        font_medium = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 24)
        font_small = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 18)
    except:
        try:
            font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 48)
            font_medium = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
            font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
        except:
            font_large = ImageFont.load_default()
            font_medium = ImageFont.load_default()
            font_small = ImageFont.load_default()
    
    # Draw title
    title_bbox = draw.textbbox((0, 0), title, font=font_large)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (width - title_width) // 2
    title_y = height // 2 - 100
    
    draw.text((title_x, title_y), title, fill='white', font=font_large)
    
    # Draw description (wrapped)
    words = description.split()
    lines = []
    current_line = []
    
    for word in words:
        test_line = ' '.join(current_line + [word])
        bbox = draw.textbbox((0, 0), test_line, font=font_medium)
        if bbox[2] - bbox[0] < width - 100:  # Leave margin
            current_line.append(word)
        else:
            if current_line:
                lines.append(' '.join(current_line))
                current_line = [word]
            else:
                lines.append(word)
    
    if current_line:
        lines.append(' '.join(current_line))
    
    # Draw lines
    line_height = 30
    start_y = title_y + 80
    
    for i, line in enumerate(lines[:4]):  # Max 4 lines
        bbox = draw.textbbox((0, 0), line, font=font_medium)
        line_width = bbox[2] - bbox[0]
        line_x = (width - line_width) // 2
        line_y = start_y + (i * line_height)
        
        draw.text((line_x, line_y), line, fill='#fbbf24', font=font_medium)
    
    # Add a border
    border_width = 4
    draw.rectangle([border_width, border_width, width-border_width, height-border_width], 
                   outline='white', width=border_width)
    
    # Save the image
    return image

async def main():
    """Main function to generate all images"""
    
    print("🎨 Generating Course and Equipment Images")
    print("=" * 50)
    
    # Initialize image manager
    manager = ImageManager()
    
    # Define equipment images to create
    equipment_images = {
        "crane-operation.jpg": {
            "title": "Crane Operation",
            "description": "Professional crane operation training with safety protocols and certification"
        },
        "excavator-training.jpg": {
            "title": "Excavator Training", 
            "description": "Comprehensive excavator operation training and safety procedures"
        },
        "safety-gear.jpg": {
            "title": "Safety Equipment",
            "description": "Personal Protective Equipment (PPE) and safety gear for construction workers"
        },
        "utility-detection.jpg": {
            "title": "Utility Detection",
            "description": "Underground utility detection and mapping technology training"
        }
    }
    
    # Create equipment images
    print("\n🔧 Creating equipment images...")
    for filename, data in equipment_images.items():
        filepath = manager.equipment_dir / filename
        
        # Check if file exists and has content
        if filepath.exists() and filepath.stat().st_size > 0:
            print(f"✅ {filename} already exists")
            continue
        
        print(f"Creating {filename}...")
        image = create_equipment_placeholder(filename, data["title"], data["description"])
        
        # Save the image
        image.save(filepath, "JPEG", quality=85)
        print(f"✅ Created {filename}")
    
    # Define course images to create
    courses = [
        {
            "id": 1,
            "title": "Plant Training & Testing",
            "description": "CPCS and NPORS plant training and technical tests for excavator, roller, dumpers, dozer, telehandler and wheeled loading shovels.",
            "category": "plant_training"
        },
        {
            "id": 2,
            "title": "Health & Safety Short Course",
            "description": "Designed to keep people safe on site, covering topics including the people plant interface. Delivered on site or at the Hub.",
            "category": "health_safety"
        },
        {
            "id": 3,
            "title": "GPS Training",
            "description": "GPS machine control and guidance training using simulation and practical exercises for excavator, dozer, roller, and grader drivers.",
            "category": "gps_training"
        },
        {
            "id": 4,
            "title": "Utility Detection Training",
            "description": "Range of utility detection, mapping and safe digging practice training at our world-class detection facility.",
            "category": "utility_detection"
        }
    ]
    
    # Create course images
    print("\n📚 Creating course images...")
    for course in courses:
        filename = f"course_{course['id']}_{manager._sanitize_filename(course['title'])}.png"
        filepath = manager.courses_dir / filename
        
        # Check if file exists
        if filepath.exists():
            print(f"✅ {filename} already exists")
            continue
        
        print(f"Creating {filename}...")
        image = create_equipment_placeholder(
            filename, 
            course["title"], 
            course["description"]
        )
        
        # Save the image
        image.save(filepath, "PNG")
        print(f"✅ Created {filename}")
    
    # Create a comprehensive image index
    print("\n📋 Creating image index...")
    image_index = {
        "courses": {},
        "equipment": {}
    }
    
    # Index course images
    for course in courses:
        filename = f"course_{course['id']}_{manager._sanitize_filename(course['title'])}.png"
        filepath = manager.courses_dir / filename
        if filepath.exists():
            image_index["courses"][course["id"]] = {
                "filename": filename,
                "url": f"/images/courses/{filename}",
                "title": course["title"]
            }
    
    # Index equipment images
    for filename in equipment_images.keys():
        filepath = manager.equipment_dir / filename
        if filepath.exists() and filepath.stat().st_size > 0:
            image_index["equipment"][filename] = {
                "filename": filename,
                "url": f"/images/equipment/{filename}",
                "title": equipment_images[filename]["title"]
            }
    
    # Save index
    index_file = manager.public_images_dir / "image_index.json"
    with open(index_file, "w") as f:
        import json
        json.dump(image_index, f, indent=2)
    
    print(f"✅ Created image index at {index_file}")
    
    print("\n" + "=" * 50)
    print("🎉 Image generation completed!")
    print(f"📁 Course images: {manager.courses_dir}")
    print(f"🔧 Equipment images: {manager.equipment_dir}")
    print(f"📋 Image index: {index_file}")

if __name__ == "__main__":
    asyncio.run(main())
