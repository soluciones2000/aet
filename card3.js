const contractSource = `
contract Card =

  record card = {
     card   : string,
     nombre : string,
     saldo  : int }

  record state = {
    cards : map(string, card) }

  entrypoint init() = { cards = {} }

  stateful entrypoint recarga_inicial( card' : string, nombre' : string, monto : int ) =
    let card = { card = card', nombre = nombre', saldo = monto }
    put(state {cards[card'] = card})

  entrypoint busca_tarjeta(card' : string) : card =
    state.cards[card']

  stateful entrypoint recarga( card' : string, monto : int ) =
    let card = busca_tarjeta( card')
    let nuevoSaldo = card.saldo + monto
    let cardActualizada = state.cards{ [card'].saldo = nuevoSaldo }
    put(state {cards = cardActualizada})

  stateful entrypoint consumo( card' : string, monto : int ) =
    let card = busca_tarjeta( card')
    let nuevoSaldo = card.saldo - monto
    if(nuevoSaldo < 0)
      abort("Saldo insuficiente")
    else
      let cardActualizada = state.cards{ [card'].saldo = nuevoSaldo }
      put(state {cards = cardActualizada})
`;

//Address of the meme voting smart contract on the testnet of the aeternity blockchain
const contractAddress = 'ct_e8g5cogFgjFnmxqxunwTNhh3psYnxxPWv3gqPbsJ9gKGCfoCF';

//Create variable for client so it can be used in different functions
let card = {};
//Create a new global array for the memes
let cards = [];

let client;

async function inicio() {
  //Initialize the Aepp object through aepp-sdk.browser.js, the base app needs to be running.
  client = await Ae.Aepp();
}

//Create a asynchronous read call for our smart contract
async function callStatic(func, args) {
  //Create a new contract instance that we can interact with
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  //Make a call to get data of smart contract func, with specefied arguments
  const calledGet = await contract.call(func, args, {callStatic: true}).catch(e => console.error(e));
  //Make another call to decode the data received in first call
  const decodedGet = await calledGet.decode().catch(e => console.error(e));

  return decodedGet;
}

//Create a asynchronous write call for our smart contract
async function contractCall(func, args, value) {
  //Create a new contract instance that we can interact with
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  //Make a call to write smart contract func, with aeon value input
  // const calledSet = await contract.call(func, args, {amount: value}).catch(e => console.error(e));
  const calledSet = await contract.call(func, args, {amount: value}).catch(e => console.error(e));

  return calledSet;
}

async function cardnew(numero,nombre,monto) {
  monto = parseFloat(monto);
  generacard(numero,nombre,monto);
  // msj1.style.display = 'block';
  msj1.innerHTML = 'Generating card, please wait...';
  //Make the contract call to register the card with the newly passed values
  await contractCall('recarga_inicial', [card1.idcard, card1.nombres, monto], 0)
  .then(() => {
    comienzo.style.display = 'none';
    // msj1.style.display = 'none';
    msj1.innerHTML = '';

    card1.dibuja('tarjeta');
    movimientos.style.display = 'block';
  }).catch((e) => {
    comienzo.style.display = 'flex';
    // msj1.style.display = 'block';
    msj1.innerHTML = 'Transaction not confirmed, card not generated.';
    movimientos.style.display = 'none';
  });
}

async function recargar() {
  if (validamonto(montotrx, montotrx.value)) {
    let trx = parseFloat(montotrx.value);
    // msj2.style.display = 'block';
    msj2.innerHTML = 'Confirming transaction, please wait...';
    //Make the contract call to register the card with the newly passed values
    await contractCall('recarga', [card1.idcard, trx], 0)
    .then(() => {
      card1.actualizaSaldo(trx);
      // msj2.style.display = 'none';
      msj2.innerHTML = '';
      montotrx.value = '';
      montotrx.focus();
    }).catch((e) => {
      // msj2.style.display = 'block';
      msj2.innerHTML = 'Transaction not confirmed, card balance was not recharged.';
      montotrx.focus();
    });
  }
}

async function consumir() {
  if (validamonto(montotrx, montotrx.value)) {
    let trx = parseFloat(montotrx.value);
    if (card1.saldo-trx>=0) {
      msj2.innerHTML = 'Confirming transaction, please wait...';
      //Make the contract call to register the card with the newly passed values
      await contractCall('consumo', [card1.idcard, trx], 0).then(() => {
        card1.actualizaSaldo(trx*-1);
        msj2.innerHTML = '';
        montotrx.value = '';
        montotrx.focus();
      }).catch((e) => {
        msj2.innerHTML = 'Transaction not confirmed, consumption was not recorded.';
        montotrx.focus();
      });
    } else {
      msj2.innerHTML = 'The amount of consumption exceeds the available balance';
      montotrx.value = '';
      montotrx.focus();
    }
  }
}
