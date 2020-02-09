let tarjeta = '1111222233334444';

let card1;

function generacard(tarjeta,nombre,monto) {
    card1 = new Card(
        tarjeta,
        './icono-01.png',
        'prepago',
        tarjeta,
        nombre,
        monto
    );
}
