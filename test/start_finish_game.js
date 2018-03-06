import { pack } from '../src/start_finish_game';
import assertRevert from './helpers/assertRevert';

var SFG = artifacts.require("./StartFinishGame.sol");
// enum names aren't supported in ABI, so have to use integers for time being
const START = 0;
const FINAL = 1;

contract('StartFinishGame', (accounts) => {
  let sfGame;
  const start = pack(START, 5, 4);
  const allowedFinal = pack(FINAL, 5, 4);
  const disallowedFinal = pack(FINAL, 15, 3);

  before(async () => {
    sfGame = await SFG.deployed();
  });

  // Transition fuction tests
  // ========================

  it("allows START -> FINAL if totals match", async () => {
    var output = await sfGame.validTransition.call(start, allowedFinal);
    assert.equal(output, true);
  });

  it("doesn't allow START -> FINAL if totals don't match", async () => {
    await assertRevert(sfGame.validTransition.call(start, disallowedFinal));
  });

  // Resolution function tests
  // =========================

  it("resolves the START correctly", async () => {
    let [aBal, bBal] = await sfGame.resolve.call(start);
    assert.equal(aBal, 5);
    assert.equal(bBal, 4);
  });

  it("resolves the FINAL correctly", async () => {
    let [aBal, bBal] = await sfGame.resolve.call(allowedFinal);
    assert.equal(aBal, 5);
    assert.equal(bBal, 4);
  });
});
