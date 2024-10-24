import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	base: '/',
	build: {
		rollupOptions: {
			input: {
				main: './index.html',
			},
		},
		outDir: 'dist',
		assetsDir: 'assets',
		emptyOutDir: true,
	},
	server: {
		historyApiFallback: true,
	},
})