import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@neylanxyz/nebula', '@neylanxyz/nebula-avalanche'],
  webpack: (config, { isServer }) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
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
