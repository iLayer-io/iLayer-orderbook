/**
 * Adjusts percentages to maintain a sum of 100% when one percentage is changed
 * @param percentages - Array of percentage strings
 * @param changedIndex - Index of the percentage that was changed
 * @param newPercentage - New percentage value (0-100)
 * @param totalTokens - Total number of tokens (to limit calculations)
 * @returns Array of adjusted percentage strings
 */
export function adjustPercentagesToSum100(
  percentages: string[],
  changedIndex: number,
  newPercentage: number,
  totalTokens: number
): string[] {
  const clampedPercentage = Math.max(0, Math.min(100, newPercentage));
  
  // Calculate new percentages array
  const newPercentages = [...percentages];
  const oldPercentage = parseFloat(newPercentages[changedIndex]) || 0;
  newPercentages[changedIndex] = clampedPercentage.toString();
  
  // Calculate the difference that needs to be distributed
  const difference = clampedPercentage - oldPercentage;
  
  // If there are other tokens to adjust
  const otherIndices = newPercentages
    .map((_, i) => i)
    .filter(i => i !== changedIndex && i < totalTokens);
  
  if (otherIndices.length > 0 && difference !== 0) {
    // Calculate current sum of other percentages
    const otherSum = otherIndices.reduce((sum, i) => sum + (parseFloat(newPercentages[i]) || 0), 0);
    
    // Calculate target sum for others (100 - new percentage)
    const targetSum = Math.max(0, 100 - clampedPercentage);
    
    if (otherSum > 0 && targetSum >= 0) {
      // Proportionally adjust other percentages
      const ratio = targetSum / otherSum;
      otherIndices.forEach(i => {
        const currentValue = parseFloat(newPercentages[i]) || 0;
        const newValue = Math.round(currentValue * ratio);
        newPercentages[i] = newValue.toString();
      });
    } else if (targetSum > 0) {
      // Distribute equally among others if current sum is 0
      const equalShare = Math.floor(targetSum / otherIndices.length);
      const remainder = targetSum % otherIndices.length;
      
      otherIndices.forEach((i, idx) => {
        const value = equalShare + (idx < remainder ? 1 : 0);
        newPercentages[i] = value.toString();
      });
    } else {
      // Set others to 0 if target sum is 0
      otherIndices.forEach(i => {
        newPercentages[i] = '0';
      });
    }
  }
  
  // Ensure the sum is exactly 100 by making small adjustments
  const finalSum = newPercentages
    .slice(0, totalTokens)
    .reduce((sum, p) => sum + (parseFloat(p) || 0), 0);
  
  if (finalSum !== 100 && totalTokens > 1) {
    const diff = 100 - finalSum;
    // Apply the difference to the largest percentage (excluding the one being edited)
    const candidates = otherIndices.map(i => ({
      index: i,
      value: parseFloat(newPercentages[i]) || 0
    })).filter(item => item.value > 0);
    
    if (candidates.length > 0) {
      const maxIndex = candidates.reduce((max, item) => 
        item.value > max.value ? item : max
      ).index;
      
      const currentValue = parseFloat(newPercentages[maxIndex]) || 0;
      const adjustedValue = Math.max(0, currentValue + diff);
      newPercentages[maxIndex] = adjustedValue.toString();
    }
  }
  
  return newPercentages;
}

/**
 * Redistributes percentages when a token is removed
 * @param percentages - Array of percentage strings
 * @param removedIndex - Index of the removed token
 * @param remainingTokenCount - Number of tokens remaining after removal
 * @returns Array of redistributed percentage strings
 */
export function redistributePercentagesOnRemoval(
  percentages: string[],
  removedIndex: number,
  remainingTokenCount: number
): string[] {
  const removedPercentage = parseFloat(percentages[removedIndex]) || 0;
  
  // Remove the percentage at the specified index
  const remainingPercentages = percentages.filter((_, index) => index !== removedIndex);
  
  // Redistribute the removed percentage among remaining tokens
  if (remainingTokenCount > 0 && removedPercentage > 0) {
    const currentRemainingSum = remainingPercentages
      .slice(0, remainingTokenCount)
      .reduce((sum, p) => sum + (parseFloat(p) || 0), 0);
    
    if (currentRemainingSum > 0) {
      // Proportionally distribute the removed percentage
      const redistributedPercentages = remainingPercentages.map((p, index) => {
        if (index >= remainingTokenCount) return p;
        
        const currentValue = parseFloat(p) || 0;
        const proportion = currentValue / currentRemainingSum;
        const additionalPercentage = removedPercentage * proportion;
        const newValue = Math.round(currentValue + additionalPercentage);
        return newValue.toString();
      });
      
      // Ensure the sum is exactly 100
      const newSum = redistributedPercentages
        .slice(0, remainingTokenCount)
        .reduce((sum, p) => sum + (parseFloat(p) || 0), 0);
      
      if (newSum !== 100 && remainingTokenCount > 0) {
        const diff = 100 - newSum;
        const firstIndex = 0; // Adjust the first token
        const firstValue = parseFloat(redistributedPercentages[firstIndex]) || 0;
        redistributedPercentages[firstIndex] = Math.max(0, firstValue + diff).toString();
      }
      
      return redistributedPercentages;
    } else {
      // If no remaining percentages, set the first token to 100%
      const newPercentages = remainingPercentages.slice();
      if (newPercentages.length > 0) {
        newPercentages[0] = '100';
      }
      return newPercentages;
    }
  }
  
  return remainingPercentages;
}

/**
 * Calculates appropriate percentage for a new token being added
 * @param currentPercentages - Array of current percentage strings
 * @param currentTokenCount - Number of current tokens
 * @returns Percentage value for the new token
 */
export function calculateNewTokenPercentage(
  currentPercentages: string[],
  currentTokenCount: number
): number {
  const currentSum = currentPercentages
    .slice(0, currentTokenCount)
    .reduce((sum, p) => sum + (parseFloat(p) || 0), 0);
  
  return Math.max(0, 100 - currentSum);
}

/**
 * Ensures percentages are valid when enabling advanced mode
 * @param percentages - Array of percentage strings
 * @param tokenCount - Number of tokens
 * @returns Array of valid percentage strings
 */
export function ensureValidPercentages(
  percentages: string[],
  tokenCount: number
): string[] {
  if (tokenCount <= 1) {
    return ['100'];
  }

  const currentSum = percentages
    .slice(0, tokenCount)
    .reduce((sum, p) => sum + (parseFloat(p) || 0), 0);
  
  if (currentSum !== 100) {
    // Set first token to 100% and others to 0%
    return percentages.map((_, index) => 
      index === 0 ? '100' : '0'
    );
  }
  
  return percentages;
}
