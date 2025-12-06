import { useState } from "react";
import { motion } from "framer-motion";

const layouts = {
  default: {
    A: "1 / 1 / 2 / 2",
    B: "1 / 2 / 2 / 3",
    C: "2 / 1 / 3 / 2",
    D: "2 / 2 / 3 / 3",
  },
  A: {
    A: "1 / 1 / 2 / 3",
    B: "2 / 3 / 3 / 4",
    C: "2 / 1 / 3 / 2",
    D: "2 / 2 / 3 / 3",
  },
  B: {
    A: "1 / 1 / 2 / 2",
    B: "1 / 2 / 3 / 3",
    C: "2 / 1 / 3 / 2",
    D: "1 / 3 / 2 / 4",
  },
  C: {
    A: "1 / 2 / 2 / 3",
    B: "1 / 3 / 2 / 4",
    C: "1 / 1 / 3 / 2",
    D: "2 / 2 / 3 / 3",
  },
  D: {
    A: "1 / 1 / 2 / 2",
    B: "1 / 2 / 2 / 3",
    C: "1 / 3 / 2 / 4",
    D: "2 / 1 / 3 / 4",
  },
};

const Box = ({ id, active, onHover }) => (
  <motion.div
    layout
    onMouseEnter={() => onHover(id)}
    className="flex items-center justify-center bg-green-900/30 border border-green-500/30 
               rounded-lg text-white font-bold cursor-pointer"
    style={{
      gridArea: layouts[active][id],
      minHeight: active === id ? "120px" : "70px",
    }}
    transition={{ layout: { duration: 0.45, ease: "easeInOut" } }}
  >
    {id}
  </motion.div>
);

export default function InteractiveGrid() {
  const [active, setActive] = useState("default");

  return (
    <div
      className="w-[350px] h-[300px] mx-auto"
      onMouseLeave={() => setActive("default")}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(3, 1fr)",
        gap: "10px",
      }}
    >
      <Box id="A" active={active} onHover={setActive} />
      <Box id="B" active={active} onHover={setActive} />
      <Box id="C" active={active} onHover={setActive} />
      <Box id="D" active={active} onHover={setActive} />
    </div> 
  );
}