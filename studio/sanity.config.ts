import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schema } from './schemaTypes'
import { structure, singletonTypes } from './structure'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID!
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

export default defineConfig({
  name: 'default',
  title: 'Gulddal Piercings',
  projectId,
  dataset,
  plugins: [structureTool({ structure }), visionTool()],
  schema,
  document: {
    // Fjern "Delete" og "Duplicate" for singletons.
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(
            ({ action }) =>
              action && ['publish', 'discardChanges', 'restore'].includes(action),
          )
        : input,
  },
})
