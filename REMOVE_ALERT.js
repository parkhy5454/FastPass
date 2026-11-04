
// 이 스크립트로 프로젝트 전체에서 로그인 성공 alert 찾아서 제거
const fs = require('fs');
const path = require('path');

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      if (['node_modules','.next','.git'].includes(file)) continue;
      scanDir(full);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes('로그인 성공') && content.includes('alert')) {
        console.log('FOUND ALERT IN:', full);
        // Auto fix
        const fixed = content
          .replace(/alert\(['"]로그인 성공!?['"]\)/g, '// alert removed - direct redirect')
          .replace(/alert\(`로그인 성공.*?`\)/g, '// alert removed')
        if (fixed !== content) {
          fs.writeFileSync(full, fixed);
          console.log('FIXED:', full);
        }
      }
    }
  }
}
scanDir('./app');
console.log('Done scanning');
