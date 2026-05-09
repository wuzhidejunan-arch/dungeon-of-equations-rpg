import { BattlePresenter } from './BattlePresenter.js';
import { BattleMenuPresenter } from './BattleMenuPresenter.js';
import { BattleDialogPresenter } from './BattleDialogPresenter.js';
import { BattleBuilderPresenter } from './BattleBuilderPresenter.js';
import { BattleNavigationPresenter } from './BattleNavigationPresenter.js';
import { BattleStatusPresenter } from './BattleStatusPresenter.js';
import { BattleHudPresenter } from './BattleHudPresenter.js';
import { BattlePresentationFacade } from './BattlePresentationFacade.js';

export function createBattlePresentationSuite({ scene } = {}) {
  const battlePresenter = new BattlePresenter({ scene });
  const battleMenuPresenter = new BattleMenuPresenter({ scene, presenter: battlePresenter });
  const battleDialogPresenter = new BattleDialogPresenter({ scene });
  const battleBuilderPresenter = new BattleBuilderPresenter({ scene });
  const battleNavigationPresenter = new BattleNavigationPresenter({
    scene,
    presenter: battlePresenter,
    menuPresenter: battleMenuPresenter,
  });
  const battleStatusPresenter = new BattleStatusPresenter({ scene });
  const battleHudPresenter = new BattleHudPresenter({ scene });
  const battlePresentation = new BattlePresentationFacade({
    presenter: battlePresenter,
    menuPresenter: battleMenuPresenter,
    dialogPresenter: battleDialogPresenter,
    builderPresenter: battleBuilderPresenter,
    navigationPresenter: battleNavigationPresenter,
    statusPresenter: battleStatusPresenter,
    hudPresenter: battleHudPresenter,
  });

  return {
    battlePresentation,
    battlePresenter,
    battleMenuPresenter,
    battleDialogPresenter,
    battleBuilderPresenter,
    battleNavigationPresenter,
    battleStatusPresenter,
    battleHudPresenter,
  };
}
