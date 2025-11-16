import { Animal, ExternalAnimal, BreedingRecord, LineageNode, PedigreeData, GeneticTrait } from '@/types';

/**
 * Get proper gender label for an animal based on type and castration status
 */
export const getGenderLabel = (animal: Animal): string => {
  if (animal.gender === 'female') {
    const femaleLabels: Record<string, string> = {
      cattle: 'Cow',
      goat: 'Doe',
      sheep: 'Ewe',
      pig: 'Sow'
    };
    return femaleLabels[animal.animal_type] || 'Female';
  }
  
  if (animal.is_castrated) {
    const castratedLabels: Record<string, string> = {
      cattle: 'Steer',
      goat: 'Wether',
      sheep: 'Wether',
      pig: 'Barrow'
    };
    return castratedLabels[animal.animal_type] || 'Castrated Male';
  }
  
  const intactLabels: Record<string, string> = {
    cattle: 'Bull',
    goat: 'Buck',
    sheep: 'Ram',
    pig: 'Boar'
  };
  return intactLabels[animal.animal_type] || 'Male';
};

/**
 * Check if an animal can be used for breeding
 */
export const canBreed = (animal: Animal): boolean => {
  if (animal.gender === 'female') return true;
  if (animal.gender === 'male' && !animal.is_castrated) return true;
  return false;
};

// Phase 8: Lineage & Pedigree Tracking Utilities

/**
 * Get all ancestors up to N generations
 */
export function getAncestors(
  animalId: number,
  generations: number,
  animals: Animal[],
  externalAnimals: ExternalAnimal[]
): LineageNode | null {
  const animal = animals.find(a => a.animal_id === animalId);
  if (!animal) return null;

  const node: LineageNode = {
    animal_id: animal.animal_id,
    animal_type: 'internal',
    tag_number: animal.tag_number,
    breed: animal.breed,
    gender: animal.gender,
    birth_date: animal.birth_date,
    generation: 0,
    breeding_value: animal.genetic_data?.breeding_value,
    inbreeding_coefficient: animal.genetic_data?.inbreeding_coefficient,
    traits: animal.genetic_data?.traits
  };

  if (generations > 0) {
    // Get mother
    if (animal.mother_animal_id) {
      const mother = getAncestors(animal.mother_animal_id, generations - 1, animals, externalAnimals);
      if (mother) node.mother = mother;
    } else if (animal.external_mother_id) {
      const externalMother = externalAnimals.find(ea => ea.external_animal_id === animal.external_mother_id);
      if (externalMother) {
        node.mother = {
          external_animal_id: externalMother.external_animal_id,
          animal_type: 'external',
          tag_number: externalMother.tag_number || 'Unknown',
          breed: externalMother.breed,
          gender: externalMother.gender || 'female',
          birth_date: externalMother.age_years ? new Date(Date.now() - externalMother.age_years * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
          farm_name: externalMother.external_farm?.farm_name,
          generation: 1
        };
      }
    }

    // Get father
    if (animal.father_animal_id) {
      const father = getAncestors(animal.father_animal_id, generations - 1, animals, externalAnimals);
      if (father) node.father = father;
    } else if (animal.external_father_id) {
      const externalFather = externalAnimals.find(ea => ea.external_animal_id === animal.external_father_id);
      if (externalFather) {
        node.father = {
          external_animal_id: externalFather.external_animal_id,
          animal_type: 'external',
          tag_number: externalFather.tag_number || 'Unknown',
          breed: externalFather.breed,
          gender: externalFather.gender || 'male',
          birth_date: externalFather.age_years ? new Date(Date.now() - externalFather.age_years * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
          farm_name: externalFather.external_farm?.farm_name,
          generation: 1
        };
      }
    }
  }

  return node;
}

/**
 * Get all descendants (children, grandchildren, etc.)
 */
export function getDescendants(
  animalId: number,
  animals: Animal[],
  breedingRecords: BreedingRecord[]
): Animal[] {
  const descendants: Animal[] = [];
  const processedIds = new Set<number>();

  function collectDescendants(id: number) {
    if (processedIds.has(id)) return;
    processedIds.add(id);

    // Find all breeding records where this animal is a parent
    const records = breedingRecords.filter(br => 
      br.sire_id === id || br.external_animal_id === id
    );

    for (const record of records) {
      if (record.offspring_ids) {
        for (const offspringId of record.offspring_ids) {
          const offspring = animals.find(a => a.animal_id === offspringId);
          if (offspring && !descendants.find(d => d.animal_id === offspring.animal_id)) {
            descendants.push(offspring);
            collectDescendants(offspring.animal_id); // Recursively get grandchildren
          }
        }
      }
    }
  }

  collectDescendants(animalId);
  return descendants;
}

/**
 * Calculate inbreeding coefficient using Wright's formula
 * Simplified version - in production, use more sophisticated algorithms
 */
export function calculateInbreedingCoefficient(
  animalId: number,
  animals: Animal[],
  externalAnimals: ExternalAnimal[]
): number {
  const animal = animals.find(a => a.animal_id === animalId);
  if (!animal || !animal.mother_animal_id || !animal.father_animal_id) {
    return 0; // No inbreeding if parents unknown or different
  }

  // Check if parents are the same animal (self-breeding - extreme case)
  if (animal.mother_animal_id === animal.father_animal_id) {
    return 1.0; // Maximum inbreeding
  }

  // Simplified calculation: check for common ancestors
  const commonAncestors = findCommonAncestors(animalId, animals, externalAnimals);
  
  if (commonAncestors.length === 0) {
    return 0; // No common ancestors = no inbreeding
  }

  // Simplified: if there are common ancestors, estimate based on generation
  // In production, use proper path coefficient method
  let coefficient = 0;
  for (const ancestor of commonAncestors) {
    // Rough estimate: 0.5^(generation) for each common ancestor
    // This is simplified - proper calculation requires path analysis
    coefficient += 0.125; // Simplified: assume 3rd generation common ancestor
  }

  return Math.min(coefficient, 1.0);
}

/**
 * Check for common ancestors in maternal and paternal lines
 */
export function findCommonAncestors(
  animalId: number,
  animals: Animal[],
  externalAnimals: ExternalAnimal[]
): Animal[] {
  const animal = animals.find(a => a.animal_id === animalId);
  if (!animal) return [];

  const commonAncestors: Animal[] = [];
  const maternalAncestors = new Set<number>();
  const paternalAncestors = new Set<number>();

  // Collect maternal ancestors
  function collectMaternal(id: number | undefined, depth: number) {
    if (!id || depth > 5) return; // Limit depth
    const a = animals.find(an => an.animal_id === id);
    if (a) {
      maternalAncestors.add(a.animal_id);
      collectMaternal(a.mother_animal_id, depth + 1);
      collectMaternal(a.father_animal_id, depth + 1);
    }
  }

  // Collect paternal ancestors
  function collectPaternal(id: number | undefined, depth: number) {
    if (!id || depth > 5) return; // Limit depth
    const a = animals.find(an => an.animal_id === id);
    if (a) {
      paternalAncestors.add(a.animal_id);
      collectPaternal(a.mother_animal_id, depth + 1);
      collectPaternal(a.father_animal_id, depth + 1);
    }
  }

  collectMaternal(animal.mother_animal_id, 0);
  collectPaternal(animal.father_animal_id, 0);

  // Find common ancestors
  for (const id of maternalAncestors) {
    if (paternalAncestors.has(id)) {
      const common = animals.find(a => a.animal_id === id);
      if (common) commonAncestors.push(common);
    }
  }

  return commonAncestors;
}

/**
 * Calculate generation number from foundation stock
 */
export function calculateGenerationNumber(
  animalId: number,
  animals: Animal[]
): number {
  const animal = animals.find(a => a.animal_id === animalId);
  if (!animal) return 0;

  // If already calculated, return it
  if (animal.genetic_data?.generation_number !== undefined) {
    return animal.genetic_data.generation_number;
  }

  // If no parents, it's generation 1 (foundation stock)
  if (!animal.mother_animal_id && !animal.father_animal_id) {
    return 1;
  }

  // Generation = max(parent generations) + 1
  let maxParentGen = 0;
  if (animal.mother_animal_id) {
    maxParentGen = Math.max(maxParentGen, calculateGenerationNumber(animal.mother_animal_id, animals));
  }
  if (animal.father_animal_id) {
    maxParentGen = Math.max(maxParentGen, calculateGenerationNumber(animal.father_animal_id, animals));
  }

  return maxParentGen + 1;
}

/**
 * Build full pedigree data structure
 */
export function buildPedigreeData(
  animalId: number,
  generations: number,
  animals: Animal[],
  externalAnimals: ExternalAnimal[],
  breedingRecords: BreedingRecord[]
): PedigreeData {
  const animal = animals.find(a => a.animal_id === animalId);
  if (!animal) {
    throw new Error(`Animal ${animalId} not found`);
  }

  const rootNode = getAncestors(animalId, generations, animals, externalAnimals);
  if (!rootNode) {
    throw new Error(`Could not build lineage for animal ${animalId}`);
  }

  // Build maternal and paternal lines
  const maternalLine: LineageNode[] = [];
  const paternalLine: LineageNode[] = [];

  function buildLines(node: LineageNode | undefined, line: LineageNode[], gen: number) {
    if (!node || gen > generations) return;
    line.push(node);
    if (node.mother) buildLines(node.mother, line, gen + 1);
    if (node.father) buildLines(node.father, line, gen + 1);
  }

  if (rootNode.mother) {
    buildLines(rootNode.mother, maternalLine, 1);
  }
  if (rootNode.father) {
    buildLines(rootNode.father, paternalLine, 1);
  }

  // Calculate statistics
  const totalExpected = Math.pow(2, generations + 1) - 2; // 2^n - 2 (excluding subject)
  const totalTracked = maternalLine.length + paternalLine.length;
  const missingAncestors = totalExpected - totalTracked;
  const completenessPercentage = totalExpected > 0 
    ? (totalTracked / totalExpected) * 100 
    : 0;

  const inbreedingCoeff = calculateInbreedingCoefficient(animalId, animals, externalAnimals);
  const commonAncestors = findCommonAncestors(animalId, animals, externalAnimals);

  // Calculate genetic diversity score (simplified)
  const geneticDiversityScore = Math.max(0, 100 - (inbreedingCoeff * 100) - (missingAncestors * 2));

  return {
    subject_animal_id: animalId,
    subject_animal: animal,
    generations,
    maternal_line: maternalLine,
    paternal_line: paternalLine,
    inbreeding_coefficient: inbreedingCoeff,
    common_ancestors: commonAncestors,
    genetic_diversity_score: geneticDiversityScore,
    total_ancestors_tracked: totalTracked,
    missing_ancestors: missingAncestors,
    completeness_percentage: completenessPercentage
  };
}

/**
 * Analyze genetic diversity for an animal
 */
export function analyzeGeneticDiversity(
  animalId: number,
  animals: Animal[],
  externalAnimals: ExternalAnimal[]
): {
  score: number;
  factors: string[];
  recommendations: string[];
} {
  const pedigreeData = buildPedigreeData(animalId, 3, animals, externalAnimals, []);
  const inbreedingCoeff = pedigreeData.inbreeding_coefficient || 0;
  const completeness = pedigreeData.completeness_percentage;
  
  const factors: string[] = [];
  const recommendations: string[] = [];
  
  // Calculate score
  let score = 100;
  
  // Deduct for inbreeding
  if (inbreedingCoeff > 0.1) {
    score -= 40;
    factors.push(`High inbreeding coefficient (${inbreedingCoeff.toFixed(3)})`);
    recommendations.push('Consider outcrossing with unrelated animals');
  } else if (inbreedingCoeff > 0.05) {
    score -= 20;
    factors.push(`Moderate inbreeding (${inbreedingCoeff.toFixed(3)})`);
    recommendations.push('Monitor genetic diversity, consider introducing new bloodlines');
  }
  
  // Deduct for incomplete lineage
  if (completeness < 50) {
    score -= 30;
    factors.push(`Incomplete lineage data (${completeness.toFixed(1)}% complete)`);
    recommendations.push('Document missing ancestors to improve genetic tracking');
  } else if (completeness < 75) {
    score -= 15;
    factors.push(`Partially complete lineage (${completeness.toFixed(1)}% complete)`);
    recommendations.push('Complete lineage documentation for better genetic analysis');
  }
  
  // Deduct for common ancestors
  if (pedigreeData.common_ancestors && pedigreeData.common_ancestors.length > 2) {
    score -= 10;
    factors.push(`${pedigreeData.common_ancestors.length} common ancestors in lineage`);
    recommendations.push('Multiple common ancestors detected - consider diverse breeding');
  }
  
  score = Math.max(0, Math.min(100, score));
  
  if (score > 80) {
    recommendations.push('Excellent genetic diversity - maintain current breeding strategy');
  } else if (score > 60) {
    recommendations.push('Good genetic diversity - continue monitoring');
  } else {
    recommendations.push('Genetic diversity needs improvement - prioritize outcrossing');
  }
  
  return { score, factors, recommendations };
}

/**
 * Predict offspring traits based on parent traits
 */
export function predictOffspringTraits(
  dam: Animal,
  sire: Animal | ExternalAnimal
): {
  trait: string;
  probability: number;
  inherited_from: 'mother' | 'father' | 'both';
}[] {
  const predictions: {
    trait: string;
    probability: number;
    inherited_from: 'mother' | 'father' | 'both';
  }[] = [];
  
  // Get traits from both parents
  const damTraits = dam.genetic_data?.traits || [];
  const sireTraits = 'genetic_data' in sire ? (sire.genetic_data?.traits || []) : [];
  
  // Combine unique traits
  const allTraitNames = new Set([
    ...damTraits.map(t => t.trait_name),
    ...sireTraits.map(t => t.trait_name)
  ]);
  
  for (const traitName of allTraitNames) {
    const damTrait = damTraits.find(t => t.trait_name === traitName);
    const sireTrait = sireTraits.find(t => t.trait_name === traitName);
    
    if (damTrait && sireTrait) {
      // Both parents have trait - high probability
      predictions.push({
        trait: traitName,
        probability: 0.85,
        inherited_from: 'both'
      });
    } else if (damTrait) {
      // Only mother has trait
      predictions.push({
        trait: traitName,
        probability: 0.50,
        inherited_from: 'mother'
      });
    } else if (sireTrait) {
      // Only father has trait
      predictions.push({
        trait: traitName,
        probability: 0.50,
        inherited_from: 'father'
      });
    }
  }
  
  return predictions;
}

/**
 * Find optimal mates for an animal based on genetic compatibility
 */
export function findOptimalMates(
  animalId: number,
  animals: Animal[],
  breedingRecords: BreedingRecord[]
): {
  animal: Animal;
  compatibility_score: number;
  reasons: string[];
  expected_inbreeding: number;
}[] {
  const animal = animals.find(a => a.animal_id === animalId);
  if (!animal) return [];
  
  // Get potential mates (opposite gender, can breed, same or compatible type)
  const potentialMates = animals.filter(a => 
    a.animal_id !== animalId &&
    a.gender !== animal.gender &&
    a.status === 'active' &&
    (a.gender === 'female' || !a.is_castrated) &&
    (animal.gender === 'female' || !animal.is_castrated) &&
    a.animal_type === animal.animal_type // Same animal type
  );
  
  const mateScores: {
    animal: Animal;
    compatibility_score: number;
    reasons: string[];
    expected_inbreeding: number;
  }[] = [];
  
  for (const mate of potentialMates) {
    const reasons: string[] = [];
    let score = 100;
    
    // Check for common ancestors (inbreeding risk)
    const commonAncestors = findCommonAncestors(animalId, animals, []);
    const mateCommonAncestors = findCommonAncestors(mate.animal_id, animals, []);
    
    // Simplified: if they share ancestors, reduce score
    const sharedAncestors = commonAncestors.filter(ca => 
      mateCommonAncestors.some(mca => mca.animal_id === ca.animal_id)
    );
    
    if (sharedAncestors.length > 0) {
      score -= sharedAncestors.length * 20;
      reasons.push(`${sharedAncestors.length} shared ancestor(s) - inbreeding risk`);
    } else {
      reasons.push('No shared ancestors - good genetic diversity');
      score += 10;
    }
    
    // Boost score if mate has high breeding value
    const mateBreedingValue = mate.genetic_data?.breeding_value || 0;
    if (mateBreedingValue > 80) {
      score += 15;
      reasons.push('High breeding value mate');
    } else if (mateBreedingValue > 60) {
      score += 5;
      reasons.push('Good breeding value');
    }
    
    // Boost if mate has verified parentage
    if (mate.genetic_data?.parentage_verified) {
      score += 5;
      reasons.push('Verified parentage');
    }
    
    // Estimate expected inbreeding (simplified)
    const expectedInbreeding = sharedAncestors.length > 0 ? 0.125 : 0;
    
    score = Math.max(0, Math.min(100, score));
    
    mateScores.push({
      animal: mate,
      compatibility_score: score,
      reasons,
      expected_inbreeding: expectedInbreeding
    });
  }
  
  // Sort by compatibility score (highest first)
  return mateScores.sort((a, b) => b.compatibility_score - a.compatibility_score);
}

/**
 * Assess inbreeding risk for a potential breeding pair
 */
export function assessInbreedingRisk(
  animalId: number,
  potentialMateId: number,
  animals: Animal[],
  externalAnimals: ExternalAnimal[]
): {
  risk_level: 'low' | 'medium' | 'high' | 'extreme';
  inbreeding_coefficient: number;
  common_ancestors: Animal[];
  recommendation: string;
} {
  const animal = animals.find(a => a.animal_id === animalId);
  const mate = animals.find(a => a.animal_id === potentialMateId);
  
  if (!animal || !mate) {
    return {
      risk_level: 'low',
      inbreeding_coefficient: 0,
      common_ancestors: [],
      recommendation: 'Cannot assess - animals not found'
    };
  }
  
  // Find common ancestors
  const animalAncestors = findCommonAncestors(animalId, animals, externalAnimals);
  const mateAncestors = findCommonAncestors(potentialMateId, animals, externalAnimals);
  
  const commonAncestors = animalAncestors.filter(ca => 
    mateAncestors.some(ma => ma.animal_id === ca.animal_id)
  );
  
  // Estimate inbreeding coefficient for potential offspring
  // Simplified calculation
  let estimatedCoeff = 0;
  if (commonAncestors.length > 0) {
    // Rough estimate: 0.5^(generation) for each common ancestor
    estimatedCoeff = commonAncestors.length * 0.125; // Simplified
  }
  
  let riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  let recommendation: string;
  
  if (estimatedCoeff > 0.25) {
    riskLevel = 'extreme';
    recommendation = 'EXTREME RISK: Do not breed these animals. High risk of genetic defects.';
  } else if (estimatedCoeff > 0.1) {
    riskLevel = 'high';
    recommendation = 'HIGH RISK: Strongly consider alternative mates. Monitor offspring closely.';
  } else if (estimatedCoeff > 0.05) {
    riskLevel = 'medium';
    recommendation = 'MODERATE RISK: Proceed with caution. Consider genetic testing.';
  } else {
    riskLevel = 'low';
    recommendation = 'LOW RISK: Safe to breed. Good genetic diversity.';
  }
  
  return {
    risk_level: riskLevel,
    inbreeding_coefficient: estimatedCoeff,
    common_ancestors: commonAncestors,
    recommendation
  };
}



