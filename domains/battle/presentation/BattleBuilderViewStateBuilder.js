import { formatBattleTemplate, getBattleUIText } from '../../../utils/battleSchema.js';

export class BattleBuilderViewStateBuilder {
  build(scene, actionType = null) {
    const chosenSkill = scene.selectedSkill || scene.playerSkills?.[0] || null;
    return {
      actionType: actionType || scene.selectedAction,
      builderMode: scene.builderMode || 'single_line',
      selectedSkill: chosenSkill,
      turnNumbers: scene.generateTurnNumbers?.() || [],
      promptText: scene.difficultyKey === 'beginner'
        ? 'Put numbers and + or - in the boxes. Press Enter.'
        : chosenSkill
          ? formatBattleTemplate(getBattleUIText('prompts.builderStart', '{skill}! Make the right answer.'), { skill: chosenSkill.name })
          : getBattleUIText('prompts.builderStartFallback', 'Make the right answer.'),
    };
  }
}
