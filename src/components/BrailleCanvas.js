import React, { useRef, useState, useEffect } from "react";
import codes from '../utils/text2braille/codes';

const DPI = 150; // Стандартное количество точек на дюйм
const MM_TO_INCH = 25.4; // Конвертация миллиметров в дюймы

const brailleMap = codes;

const BrailleCanvas = () => {
  const canvasRef = useRef(null);
  

  const [text, setText] = useState("");
  const [pageWidth, setPageWidth] = useState(100); // A4 ширина в мм
  const [pageHeight, setPageHeight] = useState(100); // A4 высота в мм
  const [marginTopMm, setMarginTopMm] = useState(10); // Отступ сверху в мм
  const [marginLeftMm, setMarginLeftMm] = useState(10); // Отступ слева в мм

  const [dotRadiusMm, setDotRadiusMm] = useState(0.9);
  const [dotSpacingMm, setDotSpacingMm] = useState(2.7);
  const [charSpacingMm, setCharSpacingMm] = useState(6.6);
  const [wordSpacingMm, setWordSpacingMm] = useState(6.4);
  const [lineSpacingMm, setLineSpacingMm] = useState(10.8);

  const mmToPixels = (mm) => (mm / MM_TO_INCH) * DPI;

  const settings = {
    dotRadius: mmToPixels(dotRadiusMm),
    dotSpacing: mmToPixels(dotSpacingMm),
    charSpacing: mmToPixels(charSpacingMm),
    wordSpacing: mmToPixels(wordSpacingMm),
    lineSpacing: mmToPixels(lineSpacingMm),
    marginTop: mmToPixels(marginTopMm),
    marginLeft: mmToPixels(marginLeftMm)
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

      const gradient = ctx.createRadialGradient(
        dotX, dotY, 0, // Начальная точка градиента
        dotX, dotY, settings.dotRadius // Конечная точка градиента
      );
      gradient.addColorStop(0, "black"); // Черный в центре
      gradient.addColorStop(1, "white"); // Белый по краям

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(dotX, dotY, settings.dotRadius, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawBraille = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Установить белый фон
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let x = settings.marginLeft;
    let y = settings.marginTop;

    for (const char of text.toLowerCase()) {
      if (char === " ") {
        x += settings.wordSpacing;
        continue;
      }

      if (char === "\n") {
        x = settings.marginLeft; // Начать с новой строки с учетом отступа
        y += settings.lineSpacing;
        continue;
      }

      const dots = brailleMap[char];
      if (dots) {
        drawBrailleChar(ctx, x, y, dots);
        x += settings.charSpacing;
      }

      // Переход на новую строку, если текст выходит за границы страницы
      if (x + settings.charSpacing > canvas.width) {
        x = settings.marginLeft;
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
  }, [pageWidth, pageHeight, settings, text]);

  const saveCanvasAsImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = "braille.png";
      link.click();
    }
  };

  return (
    <div style={{ marginBottom: "10px", marginTop: "10px", marginLeft: "40px" }}>
      <h2>Преобразователь текста в шрифт Брайля</h2>
      <div >
        <h3>Настройки страницы</h3>
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
        <br />
        <label>
          Отступ сверху (мм):
          <input
            type="number"
            value={marginTopMm}
            onChange={(e) => setMarginTopMm(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
            min="0.1"
            style={{ marginLeft: "10px" }}
          />
        </label>
        <br />
        <label>
          Отступ слева (мм):
          <input
            type="number"
            value={marginLeftMm}
            onChange={(e) => setMarginLeftMm(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
            min="0.1"
            style={{ marginLeft: "10px" }}
          />
        </label>
        <br />
        <h3>Настройки шрифта Брайля</h3>
        <label>
          Радиус точки (мм):
          <input
            type="number"
            value={dotRadiusMm}
            onChange={(e) => setDotRadiusMm(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
            min="0.1"
            style={{ marginLeft: "10px" }}
          />
        </label>
        <br />
        <label>
          Расстояние между точками (мм):
          <input
            type="number"
            value={dotSpacingMm}
            onChange={(e) => setDotSpacingMm(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
            min="0.1"
            style={{ marginLeft: "10px" }}
          />
        </label>
        <br />
        <label>
          Расстояние между символами (мм):
          <input
            type="number"
            value={charSpacingMm}
            onChange={(e) => setCharSpacingMm(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
            min="0.1"
            style={{ marginLeft: "10px" }}
          />
        </label>
        <br />
        <label>
          Расстояние между словами (мм):
          <input
            type="number"
            value={wordSpacingMm}
            onChange={(e) => setWordSpacingMm(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
            min="0.1"
            style={{ marginLeft: "10px" }}
          />
        </label>
        <br />
        <label>
          Межстрочное расстояние (мм):
          <input
            type="number"
            value={lineSpacingMm}
            onChange={(e) => setLineSpacingMm(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
            min="0.1"
            style={{ marginLeft: "10px" }}
          />
        </label>
        <br />
        
        <h3>Текст</h3>
        <label>
          
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Введите текст"
            style={{  width: "50%", height: "100px" }}
          />
        </label>
        <br />
        <button onClick={saveCanvasAsImage} style={{ marginTop: "10px", marginBottom: "10px" }}>
          Сохранить как изображение
        </button>
        <br />
        <canvas ref={canvasRef} style={{ border: "1px solid black" }}></canvas>
    
      </div>
      
      
      </div>
  );
};

export default BrailleCanvas;
