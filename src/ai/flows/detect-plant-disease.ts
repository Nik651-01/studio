
'use server';
/**
 * @fileOverview A plant disease detection AI flow.
 *
 * - detectPlantDisease - A function that handles the plant disease detection process.
 * - DetectPlantDiseaseInput - The input type for the detectPlantDisease function.
 * - DetectPlantDiseaseOutput - The return type for the detectPlantDisease function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const DetectPlantDiseaseInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectPlantDiseaseInput = z.infer<typeof DetectPlantDiseaseInputSchema>;

const DetectPlantDiseaseOutputSchema = z.object({
  identification: z.object({
    isPlant: z.boolean().describe('Whether or not the input is a plant or contains a plant.'),
    commonName: z.string().describe('The common name of the identified plant.'),
    latinName: z.string().describe('The Latin name of the identified plant.'),
  }),
  diagnosis: z.object({
    isHealthy: z.boolean().describe('Whether or not the plant is healthy.'),
    disease: z.string().describe("The name of the disease identified, or 'None' if healthy."),
    preventionAndTreatment: z.string().describe("Detailed suggestions for preventing and treating the identified disease, including organic and chemical methods if applicable. Formatted for readability.")
  }),
});
export type DetectPlantDiseaseOutput = z.infer<typeof DetectPlantDiseaseOutputSchema>;

export async function detectPlantDisease(input: DetectPlantDiseaseInput): Promise<DetectPlantDiseaseOutput> {
  return detectPlantDiseaseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectPlantDiseasePrompt',
  input: {schema: DetectPlantDiseaseInputSchema},
  output: {schema: DetectPlantDiseaseOutputSchema},
  prompt: `You are an expert botanist and plant pathologist. You will be given a photo of a plant.

Your tasks are:
1.  Identify if the image contains a plant. If not, set 'isPlant' to false and provide default values for other fields.
2.  If it is a plant, identify its common and Latin names.
3.  Analyze the plant for any signs of disease or pests.
4.  Determine if the plant is healthy.
5.  If a disease is present, identify the disease and provide detailed, actionable prevention and treatment recommendations. Include both organic and chemical options where appropriate, and format the advice for easy readability (e.g., using bullet points). If the plant is healthy, state that no disease was detected.

Analyze the following image:
Photo: {{media url=photoDataUri}}`,
});

const detectPlantDiseaseFlow = ai.defineFlow(
  {
    name: 'detectPlantDiseaseFlow',
    inputSchema: DetectPlantDiseaseInputSchema,
    outputSchema: DetectPlantDiseaseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
