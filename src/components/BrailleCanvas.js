import React, { useRef, useState, useEffect } from "react";
import codes from '../utils/text2braille/codes';

const DPI = 96; // Стандартное количество точек на дюйм
const MM_TO_INCH = 25.4; // Конвертация миллиметров в дюймы

const brailleMap = codes;

const BrailleCanvas = () => {
  const canvasRef = useRef(null);
  

  const [text, setText] = useState("");
  const [pageWidth, setPageWidth] = useState(210); // A4 ширина в мм
  const [pageHeight, setPageHeight] = useState(297); // A4 высота в мм


const mmToPixels = (mm) => (mm / MM_TO_INCH) * DPI;

  const settings = {
    dotRadius: mmToPixels(0.7),      // Радиус точки (в мм)
    dotSpacing: mmToPixels(3.5),     // Расстояние между точками внутри символа (в мм)
    charSpacing: mmToPixels(6.5),    // Расстояние между символами (в мм)
    wordSpacing: mmToPixels(13.2),   // Расстояние между словами (в мм)
    lineSpacing: mmToPixels(10.8)      // Межстрочное расстояние (в мм)
  };

  // Перевод мм в пиксели
  

  const drawBrailleChar = (ctx, x, y, dots) => {
    const positions = [
      [0, 0], [0, 1],
      [1, 0], [1, 1],
      [2, 0], [2, 1]
    ];

    dots.forEach(dot => {
      const [row, col] = positions[dot - 1];
      const dotX = x + col * settings.dotSpacing;
      const dotY = y + row * settings.dotSpacing;

      ctx.beginPath();
      ctx.arc(dotX, dotY, settings.dotRadius, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawBraille = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let x = 20;
    let y = 20;

    for (const char of text.toLowerCase()) {
      if (char === " ") {
        x += settings.wordSpacing;
        continue;
      }

      const dots = brailleMap[char];
      if (dots) {
        drawBrailleChar(ctx, x, y, dots);
        x += settings.charSpacing;
      }

      // Переход на новую строку, если текст выходит за границы страницы
      if (x + settings.charSpacing > canvas.width) {
        x = 20;
        y += settings.lineSpacing;
      }

      // Если текст выходит за высоту страницы, остановить вывод
      if (y + settings.lineSpacing > canvas.height) {
        break;
      }
    }
  };

  // Изменяем размер холста, если изменяются размеры страницы
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = mmToPixels(pageWidth);
      canvas.height = mmToPixels(pageHeight);
      drawBraille();
    }
  }, [pageWidth, pageHeight, text]);

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <label>
          Текст:
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Введите текст"
            style={{ marginLeft: "10px" }}
          />
        </label>
        <br />
        <label>
          Ширина страницы (мм):
          <input
            type="number"
            value={pageWidth}
            onChange={(e) => setPageWidth(parseFloat(e.target.value))}
            style={{ marginLeft: "10px" }}
          />
        </label>
        <br />
        <label>
          Высота страницы (мм):
          <input
            type="number"
            value={pageHeight}
            onChange={(e) => setPageHeight(parseFloat(e.target.value))}
            style={{ marginLeft: "10px" }}
          />
        </label>
      </div>
      <canvas ref={canvasRef} style={{ border: "1px solid black" }}></canvas>
    </div>
  );
};

export default BrailleCanvas;
