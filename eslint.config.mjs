import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const asArray = (config) => (Array.isArray(config) ? config : [config]);

const eslintConfig = [
  ...asArray(coreWebVitals),
  ...asArray(typescript),
  { ignores: [".next/**", "node_modules/**", "prisma/migrations/**"] },
];

export default eslintConfig;
