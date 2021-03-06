import { CountingGame } from '../../src/test-game/counting-game';
import assertRevert from '../helpers/assert-revert';

import { Channel, State } from '../../src';
import BN from 'bn.js';

const StateLib = artifacts.require("./State.sol");
const CountingStateContract = artifacts.require("./CountingState.sol");
const CountingGameContract = artifacts.require("./CountingGame.sol");
// enum names aren't supported in ABI, so have to use integers for time being
const START = 0;
const CONCLUDED = 1;

contract('CountingGame', (accounts) => {
  let game;
  let state0;
  let state1;
  let stateBalChange;

  before(async () => {
    CountingStateContract.link(StateLib);
    const stateContract = await CountingStateContract.new();
    CountingGameContract.link("CountingState", stateContract.address);
    game = await CountingGameContract.new();
    const channel = new Channel(game.address, 0, [accounts[0], accounts[1]]);

    const defaults = { channel, resolution: [new BN(5), new BN(4)] };

    state0 = CountingGame.gameState({...defaults, turnNum: 6, gameCounter: 1});
    state1 = CountingGame.gameState({...defaults, turnNum: 7, gameCounter: 2});

    stateBalChange = CountingGame.gameState({
      ...defaults,
      resolution: [new BN(6), new BN(3)],
      turnNum: 7,
      gameCounter: 2,
    });
  });

  // Transition fuction tests
  // ========================

  it("allows a move where the count increment", async () => {
    const output = await game.validTransition.call(state0.toHex(), state1.toHex());
    assert.equal(output, true);
  });

  // it("allows START -> CONCLUDED if totals match", async () => {
  //   var output = await game.validTransition.call(start, allowedConcluded);
  //   assert.equal(output, true);
  // });

  it("doesn't allow transitions if totals don't match", async () => {
    await assertRevert(game.validTransition.call(state0.toHex(), stateBalChange.toHex()));
  });
});
