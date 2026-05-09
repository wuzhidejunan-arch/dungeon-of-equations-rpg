# Battle Regression Checklist

Use this checklist after future Codex changes to verify that battle behavior still works across Beginner, Intermediate, and Challenge.

## Minimum Smoke Test

Run these after any small Codex change. This should stay under 5 minutes.

### Test name: Beginner correct skill opens builder
- Difficulty: Beginner
- Setup / starting point: Start a Beginner battle against an `even` rule enemy
- Player action: Select `Even Attack`
- Expected result: Builder opens normally with one-line `+ / -` input
- What bug it would catch: Broken Beginner skill-selection flow, wrong builder mode, wrong difficulty routing

### Test name: Beginner wrong skill may still open builder
- Difficulty: Beginner
- Setup / starting point: Same battle, enemy requires `even`
- Player action: Select `Odd Attack`
- Expected result: Builder is allowed to open for the selected wrong skill
- What bug it would catch: Incorrect pre-builder blocking behavior in Beginner

### Test name: Intermediate attack builder uses modern operators
- Difficulty: Intermediate
- Setup / starting point: Start an Intermediate battle
- Player action: Select `Heavy Strike` or another attack skill that uses the builder
- Expected result: One-line builder opens and displays multiply/divide operator glyphs for Intermediate behavior
- What bug it would catch: Wrong difficulty config lookup, wrong operator glyph mode, wrong builder mode

### Test name: Challenge attack uses chained builder
- Difficulty: Challenge
- Setup / starting point: Start a Challenge battle
- Player action: Select `Normal Attack`
- Expected result: Two-line chained builder opens
- What bug it would catch: Challenge accidentally using non-chained builder path

### Test name: Challenge utility bypasses builder
- Difficulty: Challenge
- Setup / starting point: Same Challenge battle
- Player action: Select `Defend` or `Self Buff`
- Expected result: Skill casts directly, builder does not open
- What bug it would catch: Challenge utility bypass regression

### Test name: Challenge Defend fully blocks one hit
- Difficulty: Challenge
- Setup / starting point: Challenge battle with enemy ready to attack
- Player action: Use `Defend`, then end turn / allow enemy attack
- Expected result: Player takes no damage for that hit, HUD reflects active defense state, enemy result text indicates block/no damage
- What bug it would catch: Full-defense multiplier fallback bug, HUD state mismatch, enemy-turn damage ignoring defense

### Test name: Guided battle still routes correctly
- Difficulty: Beginner, Intermediate, Challenge
- Setup / starting point: Enter each guided training battle from Training
- Player action: Start battle
- Expected result: Correct difficulty’s guided flow loads, correct skill set appears
- What bug it would catch: Scene-local difficulty routing regression, tutorial config mismatch

## Full Regression Test

## Beginner Battle Tests

### Test name: Beginner correct skill matches enemy rule
- Difficulty: Beginner
- Setup / starting point: Beginner battle against `even` enemy
- Player action: Select `Even Attack`, build a valid even result, confirm
- Expected result: Attack succeeds, enemy takes damage, result text explains success
- What bug it would catch: Wrong skill rule validation, broken selected-skill solvability, wrong damage flow

### Test name: Beginner selected skill gets solvable numbers
- Difficulty: Beginner
- Setup / starting point: Beginner battle, select `Odd Attack` against an `odd` enemy
- Player action: Inspect generated numbers for several turns
- Expected result: At least one valid expression exists for the selected skill on each generated turn
- What bug it would catch: Beginner accidentally using Intermediate-style generation, selected-skill targeting regression

### Test name: Beginner wrong skill fails after confirm
- Difficulty: Beginner
- Setup / starting point: Beginner battle against `even` enemy
- Player action: Select `Odd Attack`, build a valid expression, and confirm
- Expected result: Builder opens, the attack fails at result resolution, enemy does not take success damage, and the result feedback clearly shows failure
- What bug it would catch: Wrong-skill attack incorrectly succeeding or being blocked too early

### Test name: Beginner prime skill still opens when rule matches
- Difficulty: Beginner
- Setup / starting point: Beginner battle against a `prime` enemy if available
- Player action: Select `Prime Attack`
- Expected result: Builder opens normally and valid prime result can succeed
- What bug it would catch: Skill-goal lookup or rule-label regression for non odd/even skills

### Test name: Beginner wrong result fails after builder confirm
- Difficulty: Beginner
- Setup / starting point: Beginner battle against `even` enemy, choose `Even Attack`
- Player action: Build an odd result and confirm
- Expected result: Attack fails after confirmation, no success damage is applied
- What bug it would catch: Post-builder attack validation broken

### Test name: Beginner clear button resets builder state
- Difficulty: Beginner
- Setup / starting point: Builder open
- Player action: Place cards, then press `Clear`
- Expected result: Slots reset, cards return, preview resets
- What bug it would catch: Builder reset regression

### Test name: Beginner back exits builder without consuming turn
- Difficulty: Beginner
- Setup / starting point: Builder open
- Player action: Press `Back`
- Expected result: Returns to skill/menu state, no turn consumed, can choose again
- What bug it would catch: Builder navigation regression

### Test name: Beginner enemy turn after failed attack
- Difficulty: Beginner
- Setup / starting point: Miss or fail an attack
- Player action: Confirm failed result
- Expected result: Enemy turn still occurs correctly, HP updates correctly, logs/dialog sequence works
- What bug it would catch: Turn flow regression after failure

### Test name: Beginner wrong-skill failed attack follows normal fail turn flow
- Difficulty: Beginner
- Setup / starting point: Beginner battle against `even` enemy
- Player action: Select `Odd Attack`, build and confirm a result
- Expected result: The wrong-skill attack fails, enemy HP does not receive success damage, failure feedback is shown clearly, and turn flow continues through the current intended failure/enemy-turn behavior
- What bug it would catch: Wrong-skill failure flow diverging from normal failed-attack handling

### Test name: Beginner HP and result feedback
- Difficulty: Beginner
- Setup / starting point: Play one success and one failure turn
- Player action: Observe HUD and result box
- Expected result: HP bars, text, and battle log stay consistent with actual outcomes
- What bug it would catch: UI/result-state desync

## Intermediate Battle Tests

### Test name: Intermediate multiplication skill flow
- Difficulty: Intermediate
- Setup / starting point: Intermediate battle
- Player action: Select a multiplication-based attack skill and build a correct result
- Expected result: One-line builder opens, multiplication path works, attack resolves normally
- What bug it would catch: Intermediate operator availability regression

### Test name: Intermediate division skill flow
- Difficulty: Intermediate
- Setup / starting point: Intermediate battle
- Player action: Select division-related skill / valid division expression
- Expected result: Valid exact division is accepted and resolves correctly
- What bug it would catch: Division handling mismatch, operator token/glyph regression

### Test name: Intermediate invalid division is rejected
- Difficulty: Intermediate
- Setup / starting point: Intermediate battle
- Player action: Attempt non-exact division
- Expected result: Builder/feedback rejects it, attack does not falsely succeed
- What bug it would catch: Division validation regression

### Test name: Intermediate correct operation but wrong enemy rule
- Difficulty: Intermediate
- Setup / starting point: Enemy with a specific accepted result rule
- Player action: Use the correct operation skill but produce a result that misses the enemy rule
- Expected result: Attack fails appropriately
- What bug it would catch: Separation bug between operation-type validation and enemy-rule validation

### Test name: Intermediate wrong operation
- Difficulty: Intermediate
- Setup / starting point: Select a multiplication-only or division-only attack flow
- Player action: Attempt the wrong operator type if possible
- Expected result: Attack fails or is blocked according to current rules
- What bug it would catch: Operation-type gating regression

### Test name: Intermediate buff skill direct cast
- Difficulty: Intermediate
- Setup / starting point: Intermediate battle
- Player action: Use `Power Boost`
- Expected result: Builder does not replace intended direct-cast behavior, buff applies, HUD shows buff
- What bug it would catch: Utility/buff flow regression

### Test name: Intermediate debuff skill direct cast
- Difficulty: Intermediate
- Setup / starting point: Intermediate battle
- Player action: Use `Armor Break` or `Weaken`
- Expected result: Skill applies debuff correctly, enemy state/HUD/log reflects it
- What bug it would catch: Debuff pipeline regression

### Test name: Intermediate limited valid attack options
- Difficulty: Intermediate
- Setup / starting point: Intermediate battle, observe several fresh builder turns
- Player action: Inspect generated numbers and possible attack outcomes
- Expected result: Turn usually has a limited number of successful direct attack options rather than many broad solutions
- What bug it would catch: Intermediate accidentally using Beginner selected-skill generation or overly permissive generation

### Test name: Intermediate enemy turn and failed attack consequence
- Difficulty: Intermediate
- Setup / starting point: Fail an attack
- Player action: Confirm and continue
- Expected result: Enemy turn resolves correctly, buffs/debuffs tick correctly
- What bug it would catch: Shared turn-flow regression

### Test name: Intermediate HP and buff display
- Difficulty: Intermediate
- Setup / starting point: Apply a buff and a debuff, then take enemy turn
- Player action: Observe status summary and HP
- Expected result: Buff/debuff summaries and HP match real effects
- What bug it would catch: Numeric fallback issues, stale HUD summaries

## Challenge Battle Tests

### Test name: Challenge attack opens chained builder
- Difficulty: Challenge
- Setup / starting point: Challenge battle
- Player action: Select `Normal Attack`
- Expected result: Two-line builder opens with carry flow
- What bug it would catch: Wrong builder mode or non-chained leak

### Test name: Challenge two-line operator restrictions
- Difficulty: Challenge
- Setup / starting point: Chained builder open
- Player action: Inspect available operators for both rows
- Expected result: Row 1 uses multiply/divide only, Row 2 uses add/subtract only
- What bug it would catch: Challenge operator routing regression

### Test name: Challenge valid chained normal attack
- Difficulty: Challenge
- Setup / starting point: Challenge battle against current enemy rule
- Player action: Build a valid chain that matches the enemy rule
- Expected result: Attack succeeds and damage resolves normally
- What bug it would catch: Chained validation mismatch between UI and solver

### Test name: Challenge invalid step 1 math
- Difficulty: Challenge
- Setup / starting point: Chained builder open
- Player action: Enter a chain with wrong step 1 result/carry
- Expected result: Builder feedback rejects it as invalid chain
- What bug it would catch: Step 1 validation regression

### Test name: Challenge valid chain but wrong final enemy rule
- Difficulty: Challenge
- Setup / starting point: Challenge battle
- Player action: Build a mathematically valid chain whose final result misses the enemy rule
- Expected result: Attack fails with rule-miss feedback
- What bug it would catch: Enemy-rule matching regression in Challenge

### Test name: Challenge Heavy Attack extra condition
- Difficulty: Challenge
- Setup / starting point: Challenge battle
- Player action: Use `Heavy Attack` with a valid chain under 10, then with one over 10 that also matches rule
- Expected result: Under-10 result fails Heavy requirement, over-10 valid result succeeds
- What bug it would catch: Heavy Attack special-condition regression

### Test name: Challenge generated numbers are solvable for attack skills
- Difficulty: Challenge
- Setup / starting point: Select `Normal Attack` and `Heavy Attack` across several turns
- Player action: Inspect generated number sets
- Expected result: Each attack turn has at least one valid chained solution for the selected attack skill and current enemy condition
- What bug it would catch: Challenge unsolvable-turn regression

### Test name: Challenge utility skill builder bypass
- Difficulty: Challenge
- Setup / starting point: Challenge battle
- Player action: Select `Defend`, then `Self Buff`
- Expected result: Both cast directly without opening builder
- What bug it would catch: Utility/attack separation regression

### Test name: Challenge Defend active state and full block
- Difficulty: Challenge
- Setup / starting point: Use `Defend`, then allow enemy turn
- Player action: Observe HUD and result
- Expected result: Active defense state is shown correctly and incoming damage becomes zero for that turn
- What bug it would catch: Full block bug, multiplier coercion bug, stale HUD bug

### Test name: No Beginner or Intermediate behavior leaks into Challenge
- Difficulty: Challenge
- Setup / starting point: Challenge battle
- Player action: Use attack and utility skills, observe UI and generation
- Expected result: No one-line builder, no Beginner pre-builder skill guard, no Intermediate limited-option one-line behavior
- What bug it would catch: Cross-difficulty contamination

## Training Tests

### Test name: Beginner training stages still progress
- Difficulty: Beginner
- Setup / starting point: Enter Beginner training from stage 1 onward
- Player action: Complete or fail stages
- Expected result: Stage progression, fail messages, and unlock flow still work
- What bug it would catch: Training state regression

### Test name: Beginner guided battle uses correct lesson restrictions
- Difficulty: Beginner
- Setup / starting point: Beginner guided battle
- Player action: Try allowed and disallowed actions
- Expected result: Correct command/skill restrictions apply, guided skill remains correct
- What bug it would catch: Tutorial restriction regression

### Test name: Intermediate training stages still progress
- Difficulty: Intermediate
- Setup / starting point: Enter Intermediate training stages
- Player action: Complete practice and guided battle
- Expected result: Lessons, practice, and battle route work as before
- What bug it would catch: Training scene/controller regression

### Test name: Intermediate guided rule panel variant
- Difficulty: Intermediate
- Setup / starting point: Intermediate guided battle
- Player action: Open battle and inspect rule panel
- Expected result: Intermediate-specific guided rule panel text appears
- What bug it would catch: Difficulty training config regression

### Test name: Challenge guided battle tutorial routes correctly
- Difficulty: Challenge
- Setup / starting point: Enter Challenge guided battle
- Player action: Start battle and inspect skills/help flow
- Expected result: Challenge tutorial config loads, Challenge-specific guide mode appears
- What bug it would catch: Guided battle difficulty routing regression

## Cross-Difficulty Safety Tests

### Test name: Beginner should not use Intermediate generation behavior
- Difficulty: Beginner
- Setup / starting point: Beginner battle with selected attack skill
- Player action: Observe generated numbers over several turns
- Expected result: Numbers remain selected-skill focused, not broad limited-option Intermediate style
- What bug it would catch: Wrong `BattleMathMixin` generation mode

### Test name: Intermediate should not use Beginner selected-skill generation
- Difficulty: Intermediate
- Setup / starting point: Intermediate battle
- Player action: Observe generated turns and attack option spread
- Expected result: Generation is based on limited successful attack options, not one selected skill focus
- What bug it would catch: Wrong non-chained generation branch

### Test name: Challenge should not enter non-chained generation
- Difficulty: Challenge
- Setup / starting point: Challenge battle
- Player action: Open attack builder and inspect numbers/rows
- Expected result: Chained generation path only, never the one-line path
- What bug it would catch: Wrong builder mode or generation mode assignment

### Test name: Difficulty config fields match live behavior
- Difficulty: All
- Setup / starting point: Start one battle per difficulty
- Player action: Inspect builder style, utility bypass, guided panel behavior
- Expected result:
  - Beginner: classic glyph mode, no utility bypass, default guided panel
  - Intermediate: modern glyph mode, no utility bypass, intermediate guided panel
  - Challenge: modern glyph mode, utility bypass enabled, chained builder
- What bug it would catch: Config-contract drift

## Risky Areas Not Easy To Test Manually

- Exact count of Intermediate “1 to 2 valid attack options” per generated turn is hard to verify quickly without a solver/debug overlay.
- Whether fallback battle paths are ever hit outside normal controller flow is hard to confirm without instrumentation.
- Full parity of Challenge number solvability across many enemy states is hard to prove manually without debug tools that enumerate valid chains.
- Silent fallback/default-value issues in buff/debuff math are hard to catch without a temporary debug state panel or combat trace log.

## Recommended Run Order

### Smoke
1. Beginner wrong skill may open builder but fail after confirm
2. Beginner correct skill opens builder and succeeds
3. Intermediate attack builder opens with correct operator style
4. Challenge attack opens chained builder
5. Challenge utility bypass works
6. Challenge Defend fully blocks one enemy hit
7. One guided battle per difficulty opens the correct tutorial flow

### Full regression
1. Beginner full checklist
2. Intermediate full checklist
3. Challenge full checklist
4. Training checklist
5. Cross-difficulty safety checklist
