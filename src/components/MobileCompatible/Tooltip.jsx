import { TooltipLite } from 'tdesign-react';
import { useIsMobile } from '@src/utils/use';

function Tooltip(props) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return props.children;
  }
  return (
    <TooltipLite className={props?.content ? '' : 'opacity-0'} {...props}>
      {props.children}
    </TooltipLite>
  );
}

export default Tooltip;
