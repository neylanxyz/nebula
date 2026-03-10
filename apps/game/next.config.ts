import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@neylanxyz/nebula', '@neylanxyz/nebula-avalanche'],
  webpack: (config, { isServer }) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    // pnpm symlinks: resolve packages via their symlinked path, not the real path
    config.resolve.symlinks = false;
    // porto/internal re-exports `zod/mini` (zod v4), but with symlinks:false webpack
    // resolves `zod` from the shared pnpm location which is v3 (no /mini export).
    // Point zod/mini explicitly to the zod v4 copy bundled with porto.
    config.resolve.alias = {
      ...config.resolve.alias,
      'zod/mini': path.resolve(
        __dirname,
        '../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/mini/index.js',
      ),
    };
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    // WalletConnect uses pino which tries to require pino-pretty
    config.externals = [...(config.externals || []), 'pino-pretty'];
    return config;
  },
};

export default nextConfig;
