const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Fix SMCreator & Checklist by removing the complex Unsplash URL from className
  // and adding an inline style for it. We will just remove it from className.
  // Wait, I will just do exact replacements.

  // 1. Remove the bad background class
  code = code.replace(
    /bg-\[url\(https:\/\/images\.unsplash\.com[^\]]+\)\]/g,
    ""
  );
  code = code.replace(
    /bg-\[url\(\'https:\/\/images\.unsplash\.com[^\)]+\'\)\]/g,
    ""
  );


  // 2. We can restore the other patterns to be properly formatted if needed,
  // transparenttextures actually works fine if we just don't have Vite panic on the first one. Let's make sure they are valid CSS.
  code = code.replace(/bg-\[url\(https:\/\/www\.transparenttextures\.com[^\)]+\)\]/g, "bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]");

  fs.writeFileSync(file, code);
}

fixFile('src/components/SMCreator.tsx');
fixFile('src/components/Checklist.tsx');
