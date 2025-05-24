/**
 * Extracts JSON from LLM output that contains JSON within markdown code blocks
 */
export class JsonExtractor {
  /**
   * Extracts and parses JSON from LLM output text
   * @param output The text output from an LLM containing JSON in markdown code blocks
   * @returns Parsed JSON object
   * @throws Error if JSON cannot be extracted or parsed
   */
  static extractJson(output: string): any {
    try {
      let jsonMatch = output.match(/```json\s*(\{.*?\})\s*```/s);
      
      if (!jsonMatch) {
        jsonMatch = output.match(/```\s*(\{.*?\})\s*```/s);
      }
      
      if (!jsonMatch) {
        throw new Error("Could not extract JSON from output");
      }
      
      const jsonStr = jsonMatch[1].trim();
      return JSON.parse(jsonStr);
    } catch (error: any) {
      console.error("⚠️ Error: Invalid JSON response!");
      throw new Error(`Failed to parse JSON: ${error.message}`);
    }
  }
}