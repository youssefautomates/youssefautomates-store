const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/app/courses/[slug]/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Regex for handleAddToCart that is line ending independent
const addToCartRegex = /(const handleAddToCart = \(\) => \{[\s\S]*?addToCart\([\s\S]*?category:\s*"courses",[\s\S]*?\}\s*as\s*any\);)([\s\S]*?\};)/;

if (addToCartRegex.test(content)) {
  content = content.replace(addToCartRegex, (match, p1, p2) => {
    return `${p1}\n    trackAddToCart(course.id, course.title, coursePricing.price, currency, "course");${p2}`;
  });
  console.log("Successfully replaced handleAddToCart.");
  fs.writeFileSync(filePath, content, 'utf8');
} else {
  console.log("Could not find handleAddToCart target using regex.");
}
