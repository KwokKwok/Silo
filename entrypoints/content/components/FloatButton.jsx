import { useState, useEffect, useRef } from 'react';
import logo from '../../../public/logo.svg';

export default function FloatButton({ onClick }) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(() => {
    // 从 localStorage 读取保存的位置，默认 2/3 高度
    const saved = localStorage.getItem('floatButtonPosition');
    return saved ? parseInt(saved) : Math.floor((window.innerHeight / 3) * 2);
  });
  const domRef = useRef(null);

  // 添加全局鼠标事件监听
  useEffect(() => {
    let startOffsetY = 0;
    let isDragging = false;
    const _setIsDragging = value => {
      isDragging = value;
      setIsDragging(value);
    };
    const dom = domRef.current;
    let domDownTime = 0;
    // 处理拖拽
    const handleMouseDown = e => {
      const domTop = dom.getBoundingClientRect().top;
      startOffsetY = e.clientY - domTop;
      domDownTime = Date.now();
      _setIsDragging(true);
    };
    const handleMouseMove = e => {
      if (isDragging) {
        // 计算新位置，确保按钮不会超出屏幕
        const newY = Math.min(
          Math.max(e.clientY - startOffsetY, 36), // 顶部边界（按钮高度）
          window.innerHeight - 36 // 底部边界
        );
        setPosition(newY);
      }
    };

    const handleMouseUp = () => {
      const domUpTime = Date.now();
      if (domUpTime - domDownTime < 200) {
        onClick();
      }
      _setIsDragging(false);
      // 保存位置到 localStorage
      setPosition(prev => {
        localStorage.setItem('floatButtonPosition', prev.toString());
        return prev;
      });
    };

    if (dom) {
      dom.addEventListener('mousedown', handleMouseDown);
    }
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [setPosition, setIsDragging, onClick]);

  return (
    <div
      ref={domRef}
      className={`fixed z-[999999] w-[56px] filter backdrop-blur-sm h-[36px] translate-x-[20px] hover:translate-x-[0] opacity-70 hover:opacity-100 transition-[transform,opacity] duration-300 right-0 bg-primary bg-opacity-20 rounded-l-full pl-[12px] flex items-center select-none ${
        isDragging
          ? 'cursor-grabbing !translate-x-[0] !opacity-100'
          : 'cursor-pointer'
      }`}
      style={{ top: `${position}px` }}
    >
      <img src={logo} className="w-4 pointer-events-none" />
    </div>
  );
}
