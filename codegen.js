// codegen.js
const fs = require('fs');
const path = require('path');
const openapiTS = require('openapi-typescript').default;

// --- CONFIGURATION ---
// We've replaced the public URL with your local server address.
const LOCAL_API_BASE_URL = 'http://127.0.0.1:8000'; // Using 127.0.0.1 is sometimes more reliable than 'localhost'

const config = {
  services: [
    // The path after the port comes from your `integration_map_v2_full.json`
    { name: 'auth', url: `${LOCAL_API_BASE_URL}/api/v2/auth/openapi.json` },
    { name: 'org', url: `${LOCAL_API_BASE_URL}/api/v2/org/openapi.json` },
    // ... add all other services from your JSON file here, following the same pattern
  ],
  typesPath: 'generated/types',
  hooksPath: 'generated/hooks',
};

async function generate() {
  console.log('Starting code generation...');
  console.log(`Fetching OpenAPI specs from: ${LOCAL_API_BASE_URL}`);


  // Ensure output directories exist
  if (!fs.existsSync(config.typesPath)) fs.mkdirSync(config.typesPath, { recursive: true });
  if (!fs.existsSync(config.hooksPath)) fs.mkdirSync(config.hooksPath, { recursive: true });


  for (const service of config.services) {
    try {
        console.log(`Fetching OpenAPI spec for: ${service.name}`);
        const typesContent = await openapiTS(new URL(service.url));

        const typesFilePath = path.join(config.typesPath, `${service.name}.ts`);
        fs.writeFileSync(typesFilePath, typesContent);
        console.log(`✅ Wrote types to ${typesFilePath}`);

        // This is where you would generate the React Query hooks
        const hooksFilePath = path.join(config.hooksPath, `${service.name}.ts`);
        const hooksContent = `// Hooks for ${service.name} service - generated automatically\n`;
        fs.writeFileSync(hooksFilePath, hooksContent);
        console.log(`✅ Wrote placeholder hooks to ${hooksFilePath}`);

    } catch (error) {
        console.error(`❌ Failed to generate code for service: ${service.name}`);
        console.error(error.message); // Print a cleaner error message
    }
  }

  console.log('Code generation finished.');
}

generate();