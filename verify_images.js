#!/usr/bin/env node
/**
 * Image Verification Script
 * Verifies all images exist and are properly sized for Vercel deployment
 */

const fs = require('fs');
const path = require('path');

// Define expected images from the frontend components
const expectedImages = {
  courses: [
    '/images/equipment/forward-tipping-dumper.webp',
    '/images/courses/H&S.webp', 
    '/images/courses/gps training.jpeg',
    '/images/courses/streetworks.jpg',
    '/images/courses/plant-training.jpg',
    '/images/courses/flannery training 2 .webp'
  ],
  equipment: [
    '/images/equipment/forward-tipping-dumper.webp',
    '/images/equipment/crane-operation.jpg',
    '/images/equipment/excavator-training.jpg', 
    '/images/equipment/safety-gear.jpg',
    '/images/equipment/utility-detection.jpg'
  ],
  facilities: [
    '/images/facilities/training-hall.jpg',
    '/images/facilities/simulator-room.jpg',
    '/images/facilities/assessment-center.jpg',
    '/images/facilities/practical-area.jpg'
  ],
  testimonials: [
    '/images/testimonials/chris.jpg',
    '/images/testimonials/howard.jpg',
    '/images/testimonials/phil.jpg',
    '/images/testimonials/gc.jpg',
    '/images/testimonials/mo.jpg',
    '/images/testimonials/sd.jpg'
  ]
};

function checkImage(imagePath) {
  const fullPath = path.join(__dirname, 'frontend/public', imagePath);
  
  if (!fs.existsSync(fullPath)) {
    return { exists: false, size: 0, error: 'File not found' };
  }
  
  const stats = fs.statSync(fullPath);
  const size = stats.size;
  
  if (size === 0) {
    return { exists: true, size: 0, error: 'Empty file' };
  }
  
  return { exists: true, size: size, error: null };
}

function verifyImages() {
  console.log('🔍 Verifying Images for Vercel Deployment');
  console.log('=' * 50);
  
  let totalImages = 0;
  let missingImages = 0;
  let emptyImages = 0;
  let validImages = 0;
  
  const results = {};
  
  for (const [category, images] of Object.entries(expectedImages)) {
    console.log(`\n📁 ${category.toUpperCase()}:`);
    results[category] = [];
    
    for (const imagePath of images) {
      totalImages++;
      const result = checkImage(imagePath);
      results[category].push({ path: imagePath, ...result });
      
      if (!result.exists) {
        console.log(`  ❌ ${imagePath} - NOT FOUND`);
        missingImages++;
      } else if (result.size === 0) {
        console.log(`  ⚠️  ${imagePath} - EMPTY (${result.size} bytes)`);
        emptyImages++;
      } else {
        console.log(`  ✅ ${imagePath} - OK (${Math.round(result.size / 1024)}KB)`);
        validImages++;
      }
    }
  }
  
  // Summary
  console.log('\n' + '=' * 50);
  console.log('📊 SUMMARY:');
  console.log(`  Total images: ${totalImages}`);
  console.log(`  ✅ Valid: ${validImages}`);
  console.log(`  ❌ Missing: ${missingImages}`);
  console.log(`  ⚠️  Empty: ${emptyImages}`);
  
  if (missingImages === 0 && emptyImages === 0) {
    console.log('\n🎉 All images are ready for Vercel deployment!');
    return true;
  } else {
    console.log('\n⚠️  Some images need attention before deployment.');
    return false;
  }
}

// Check if we're in the right directory
if (!fs.existsSync(path.join(__dirname, 'frontend/public/images'))) {
  console.error('❌ Error: frontend/public/images directory not found');
  console.error('Please run this script from the project root directory');
  process.exit(1);
}

// Run verification
const success = verifyImages();
process.exit(success ? 0 : 1);
