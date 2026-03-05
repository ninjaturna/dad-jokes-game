// Post-build: swap index.html so the coming soon page serves at /
// and the React SPA serves at /game.html (referenced by vercel.json rewrites)
import { copyFileSync, renameSync } from 'fs'

renameSync('dist/index.html', 'dist/game.html')
copyFileSync('public/root.html', 'dist/index.html')

console.log('post-build: dist/index.html → coming soon | dist/game.html → React SPA')
