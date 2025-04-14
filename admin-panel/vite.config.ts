import react from '@vitejs/plugin-react';
import 'dotenv/config';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

// eslint-disable-next-line import/no-anonymous-default-export
export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const { VITE_NODE_ENV } = process.env;

  return defineConfig({
    mode: VITE_NODE_ENV,
    plugins: [react()],
    resolve: {
      alias: {
        '@app': path.resolve(__dirname, './src'),
        '@store': path.resolve(__dirname, './src/store'),
        '@components': path.resolve(__dirname, './src/components'),
        '@modules': path.resolve(__dirname, './src/modules'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@services': path.resolve(__dirname, './src/services'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@styles': path.resolve(__dirname, './src/styles'),
        '@configs': path.resolve(__dirname, './src/configs'),
        '@aki_types': path.resolve(__dirname, './src/types')
      },
    },
  });
};
