export default {
  capitalize: (string: string) => {
    return string
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },
  capitalizeFirstWord: (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
  uppercase: (string: string) => {
    return string.toUpperCase();
  },
  lowercase: (string: string) => {
    return string.toLowerCase();
  },
};
