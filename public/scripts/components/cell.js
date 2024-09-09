export function Cell() {
  let sign = " ";

  const addSign = (player) => (sign = player.sign);
  const getSign = () => {
    return sign;
  };
  return { addSign, getSign };
}
