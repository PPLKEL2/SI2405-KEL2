declare module "next" {
  export type Metadata = {
    title?: string;
    description?: string;
    [key: string]: any;
  };
  export type NextConfig = {
    [key: string]: any;
  };
}

declare module "next/link" {
  import React from "react";
  const Link: React.ComponentType<any>;
  export default Link;
}

declare module "next/dynamic" {
  import React from "react";
  export default function dynamic<P = {}>(
    loader: () => Promise<React.ComponentType<P> | { default: React.ComponentType<P> }>,
    options?: {
      ssr?: boolean;
      loading?: () => React.ReactNode;
    }
  ): React.ComponentType<P>;
}

