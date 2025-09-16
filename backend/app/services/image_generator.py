"""
AI Image Generation Service
Generates course images using AI and manages image assets
"""

import os
import requests
import base64
from typing import Dict, List, Optional, Any
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFont
import io

class AIImageGenerator:
    """AI-powered image generation service"""
    
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.base_url = "https://api.openai.com/v1/images/generations"
        
    async def generate_course_image(self, course_title: str, course_description: str, 
                                  category: str = "construction") -> Dict[str, Any]:
        """Generate an AI image for a course"""
        
        if not self.api_key:
            return self._create_fallback_image(course_title, category)
        
        try:
            # Create a detailed prompt for construction/plant training
            prompt = self._create_image_prompt(course_title, course_description, category)
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": "dall-e-3",
                "prompt": prompt,
                "n": 1,
                "size": "1024x1024",
                "quality": "standard"
            }
            
            response = requests.post(self.base_url, headers=headers, json=data, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                image_url = result["data"][0]["url"]
                
                # Download and save the image
                image_data = requests.get(image_url).content
                
                return {
                    "status": "success",
                    "image_data": image_data,
                    "image_url": image_url,
                    "prompt": prompt
                }
            else:
                print(f"OpenAI API error: {response.status_code} - {response.text}")
                return self._create_fallback_image(course_title, category)
                
        except Exception as e:
            print(f"Error generating AI image: {e}")
            return self._create_fallback_image(course_title, category)
    
    def _create_image_prompt(self, title: str, description: str, category: str) -> str:
        """Create a detailed prompt for image generation"""
        
        base_prompts = {
            "construction": "Professional construction site with heavy machinery, safety equipment, and workers in high-visibility clothing",
            "plant_training": "Heavy construction equipment like excavators, dumpers, and cranes in a training environment with safety barriers",
            "health_safety": "Construction safety training scene with PPE equipment, safety signs, and workers following safety protocols",
            "gps_training": "GPS and machine control technology in construction equipment, digital displays, and precision work",
            "utility_detection": "Utility detection equipment, underground mapping technology, and safe digging practices"
        }
        
        base_prompt = base_prompts.get(category.lower(), base_prompts["construction"])
        
        return f"{base_prompt}. {title}: {description}. Professional, high-quality, realistic construction training environment. UK construction standards, modern equipment, safety-focused. Photorealistic style, well-lit, professional photography quality."
    
    def _create_fallback_image(self, course_title: str, category: str) -> Dict[str, Any]:
        """Create a fallback image when AI generation fails"""
        
        try:
            # Create a simple image with text
            width, height = 1024, 1024
            image = Image.new('RGB', (width, height), color='#1e40af')  # Blue background
            
            draw = ImageDraw.Draw(image)
            
            # Try to use a system font, fallback to default
            try:
                font_large = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 48)
                font_medium = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 24)
            except:
                font_large = ImageFont.load_default()
                font_medium = ImageFont.load_default()
            
            # Draw title
            title_bbox = draw.textbbox((0, 0), course_title, font=font_large)
            title_width = title_bbox[2] - title_bbox[0]
            title_x = (width - title_width) // 2
            title_y = height // 2 - 50
            
            draw.text((title_x, title_y), course_title, fill='white', font=font_large)
            
            # Draw category
            category_text = f"{category.upper()} TRAINING"
            cat_bbox = draw.textbbox((0, 0), category_text, font=font_medium)
            cat_width = cat_bbox[2] - cat_bbox[0]
            cat_x = (width - cat_width) // 2
            cat_y = title_y + 80
            
            draw.text((cat_x, cat_y), category_text, fill='#fbbf24', font=font_medium)
            
            # Convert to bytes
            img_buffer = io.BytesIO()
            image.save(img_buffer, format='PNG')
            img_data = img_buffer.getvalue()
            
            return {
                "status": "fallback",
                "image_data": img_data,
                "image_url": None,
                "prompt": f"Fallback image for {course_title}"
            }
            
        except Exception as e:
            print(f"Error creating fallback image: {e}")
            return {
                "status": "error",
                "image_data": None,
                "image_url": None,
                "prompt": "Failed to create image"
            }

class ImageManager:
    """Manages course images and assets"""
    
    def __init__(self):
        self.images_dir = Path("converted_content/images")
        self.public_images_dir = Path("frontend/public/images")
        self.courses_dir = self.public_images_dir / "courses"
        self.equipment_dir = self.public_images_dir / "equipment"
        
        # Ensure directories exist
        self.images_dir.mkdir(parents=True, exist_ok=True)
        self.courses_dir.mkdir(parents=True, exist_ok=True)
        self.equipment_dir.mkdir(parents=True, exist_ok=True)
    
    async def generate_course_images(self, courses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate images for all courses"""
        
        generator = AIImageGenerator()
        results = {}
        
        for course in courses:
            course_id = course.get("id")
            title = course.get("title", "")
            description = course.get("description", "")
            category = course.get("category", "construction").lower()
            
            # Generate image
            result = await generator.generate_course_image(title, description, category)
            
            if result["status"] in ["success", "fallback"] and result["image_data"]:
                # Save image
                filename = f"course_{course_id}_{self._sanitize_filename(title)}.png"
                filepath = self.courses_dir / filename
                
                with open(filepath, "wb") as f:
                    f.write(result["image_data"])
                
                results[course_id] = {
                    "filename": filename,
                    "filepath": str(filepath),
                    "status": result["status"],
                    "prompt": result.get("prompt", "")
                }
            else:
                results[course_id] = {
                    "filename": None,
                    "filepath": None,
                    "status": "error",
                    "prompt": "Failed to generate"
                }
        
        return results
    
    def create_equipment_images(self) -> Dict[str, str]:
        """Create placeholder equipment images"""
        
        equipment_images = {
            "crane-operation.jpg": "Crane operation training with safety protocols",
            "excavator-training.jpg": "Excavator training in controlled environment",
            "safety-gear.jpg": "Personal Protective Equipment (PPE) for construction",
            "utility-detection.jpg": "Utility detection and mapping equipment"
        }
        
        results = {}
        generator = AIImageGenerator()
        
        for filename, description in equipment_images.items():
            filepath = self.equipment_dir / filename
            
            # Check if file exists and has content
            if filepath.exists() and filepath.stat().st_size > 0:
                results[filename] = str(filepath)
                continue
            
            # Generate image
            result = generator._create_fallback_image(description, "equipment")
            
            if result["status"] in ["success", "fallback"] and result["image_data"]:
                with open(filepath, "wb") as f:
                    f.write(result["image_data"])
                results[filename] = str(filepath)
            else:
                results[filename] = None
        
        return results
    
    def _sanitize_filename(self, filename: str) -> str:
        """Sanitize filename for safe storage"""
        import re
        # Remove special characters and replace spaces with underscores
        sanitized = re.sub(r'[^\w\s-]', '', filename)
        sanitized = re.sub(r'[-\s]+', '_', sanitized)
        return sanitized.lower()
    
    def get_course_image_url(self, course_id: int, course_title: str) -> str:
        """Get the URL for a course image"""
        filename = f"course_{course_id}_{self._sanitize_filename(course_title)}.png"
        filepath = self.courses_dir / filename
        
        if filepath.exists():
            return f"/images/courses/{filename}"
        else:
            # Return a default image
            return "/images/courses/plant-training.jpg"
    
    def get_equipment_image_url(self, equipment_name: str) -> str:
        """Get the URL for an equipment image"""
        filename = f"{equipment_name}.jpg"
        filepath = self.equipment_dir / filename
        
        if filepath.exists() and filepath.stat().st_size > 0:
            return f"/images/equipment/{filename}"
        else:
            # Return a default image
            return "/images/equipment/forward-tipping-dumper.png"
