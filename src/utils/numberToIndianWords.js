export const numberToIndianWords = num => {
  const a = [
    '',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
  ];

  const b = [
    '',
    '',
    'twenty',
    'thirty',
    'forty',
    'fifty',
    'sixty',
    'seventy',
    'eighty',
    'ninety',
  ];

  const convert = n => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + ' ' + a[n % 10];

    if (n < 1000)
      return a[Math.floor(n / 100)] + ' hundred ' + convert(n % 100);

    if (n < 100000)
      return convert(Math.floor(n / 1000)) + ' thousand ' + convert(n % 1000);

    if (n < 10000000)
      return convert(Math.floor(n / 100000)) + ' lakh ' + convert(n % 100000);

    return (
      convert(Math.floor(n / 10000000)) + ' crore ' + convert(n % 10000000)
    );
  };

  return convert(num).trim();
};
