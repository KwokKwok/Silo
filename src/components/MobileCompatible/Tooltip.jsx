import { TooltipLite } from "tdesign-react";
import { useIsMobile } from "../../utils/use";

function Tooltip (props) {
    const isMobile = useIsMobile();
    if (isMobile) {
        return props.children;
    }
    return <TooltipLite {...props}>{props.children}</TooltipLite>
}

export default Tooltip;