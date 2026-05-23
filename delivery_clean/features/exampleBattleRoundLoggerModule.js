export const exampleBattleRoundLoggerModule = {
  id: 'example-battle-round-logger-module',
  dependsOn: ['default-battle-feature-module'],
  install({ container }) {
    const registry = container.get('battleFeatureRegistry');
    if (!registry) return;

    registry.register({
      id: 'example-battle-round-logger',
      order: 50,
      hooks: {
        afterResolveAttack({ context, payload }) {
          const outcome = payload?.resolved;
          if (!outcome) return;

          context.scene?.addBattleLog?.(
            `[Feature] Attack resolved with result ${payload.result} and ${outcome.success ? 'success' : 'failure'}.`
          );
        },
      },
    });
  },
};
