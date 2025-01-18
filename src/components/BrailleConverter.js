import React, { useState } from 'react';
import toBraille from '../utils/text2braille/toBraille';
    
const BrailleConverter = () => {
  const [inputText, setInputText] = useState('');
  const [brailleText, setBrailleText] = useState('');

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const convertToBraille = () => {
    const braille = toBraille(inputText);
    setBrailleText(braille);
  };

  return (
    <div>
      <h2>Преобразователь текста в шрифт Брайля</h2>
      <input
        type="text"
        value={inputText}
        onChange={handleInputChange}
        placeholder="Введите текст"
      />
      <button onClick={convertToBraille}>Преобразовать</button>
      <div>
        <h3>Результат:</h3>
        <p>{brailleText}</p>
      </div>
    </div>
  );
};

export default BrailleConverter; 