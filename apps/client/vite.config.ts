import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { networkInterfaces } from 'os';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const networkIP = getNetworkIP();

  // Replace @ip with the actual network IP in environment variables
  for (const key in env) {
    if (typeof env[key] === 'string') {
      env[key] = env[key].replace('@ip', networkIP);
    }
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      host: true, // This is needed to expose the server to the network
      port: 9007 // Set your desired port here
    },
    define: {
      'import.meta.env.VITE_NETWORK_IP': JSON.stringify(networkIP),
      ...Object.fromEntries(
        Object.entries(env).map(([key, value]) => [
          `import.meta.env.${key}`,
          JSON.stringify(value)
        ])
      ),
    }
  }
});

function getNetworkIP() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost'; // Fallback to localhost if no network IP is found
}
