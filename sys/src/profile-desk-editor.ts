const lines = [
  ["const sky = ", '"peach";'],
  ["const room = {", ""],
  ["  light: sky,", ""],
  ["  plants: ", "3,"],
  ["  coffee: ", "true,"],
  ["};", ""],
  ["draw(room);", ""],
];
const length = lines.reduce((count, line) => count + line.join("").length + 1, 0);

export function createDeskEditor() {
  const canvas = document.createElement("canvas");
  canvas.width = 480;
  canvas.height = 268;
  const context = canvas.getContext("2d");
  if (!context) return;
  const brush = context;

  function paint(time?: number) {
    const animated = time !== undefined;
    const frame = animated ? Math.floor(time / 80) : length;
    let remaining = animated ? Math.min(length, (22 + frame) % (length + 33)) : length;
    const cursor = animated && Math.floor(time / 450) % 2 === 0;
    brush.fillStyle = "#302b39";
    brush.fillRect(0, 0, canvas.width, canvas.height);
    brush.fillStyle = "#453b49";
    brush.fillRect(0, 0, canvas.width, 36);

    for (const [index, color] of ["#eb9a77", "#e5bf7d", "#9eb995"].entries()) {
      brush.fillStyle = color;
      brush.beginPath();
      brush.arc(18 + index * 15, 18, 4, 0, 2 * Math.PI);
      brush.fill();
    }
    brush.font = "12px monospace";
    brush.fillStyle = "#d0b9b6";
    brush.fillText("room.js", 78, 24);
    brush.font = "10px monospace";

    lines.forEach(([code, literal], index) => {
      const text = code + literal;
      const baseline = 57 + index * 15;
      const typed = text.slice(0, Math.max(0, remaining));
      brush.fillStyle = "#a68b9f";
      brush.fillText(String(index + 1), 17, baseline);
      brush.fillStyle = index < 2 ? "#e9ad9b" : "#b6cbb3";
      brush.fillText(typed.slice(0, code.length), 51, baseline);
      brush.fillStyle = "#f3d995";
      brush.fillText(typed.slice(code.length), 51 + brush.measureText(code).width, baseline);
      if (cursor && remaining >= 0 && remaining <= text.length) {
        brush.fillRect(51 + brush.measureText(typed).width, baseline - 8, 1.2, 10);
      }
      remaining -= text.length + 1;
    });
  }

  paint();
  return { canvas, paint };
}
