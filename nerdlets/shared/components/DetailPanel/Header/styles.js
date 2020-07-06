import styled from 'styled-components';
import { StackItem, Icon } from 'nr1';

export const BreadcrumbContainer = styled(StackItem)`
  display: flex;
  justify-content: center;
  padding: 16px;
  margin-bottom: 0;
  white-space: nowrap;
`;

export const Breadcrumbs = styled.ul`
  margin-bottom: 0;
`;

export const Breadcrumb = styled.li`
  display: inline;
  position: relative;
  z-index: 10;
  padding: 3px 8px;
  color: #464e4e;
  margin-right: 3px;
  font-size: 10px;

  :before {
    content: '';
    position: absolute;
    top: 0px;
    right: 0;
    left: 0;
    z-index: -1;
    width: 100%;
    height: 50%;
    background-color: #edeeee;
    transform: skew(35deg);
  }

  :after {
    content: '';
    position: absolute;
    right: 0;
    left: 0;
    bottom: 0.1px;
    z-index: -1;
    width: 100%;
    height: 50%;
    background-color: #edeeee;
    transform: skew(-35deg);
  }

  :first-child {
    padding-right: 4px;
    margin-right: 8px;
    border-radius: 3px 0 0 3px;
    background-color: #edeeee;

    :before,
    :after {
      left: 5px;
    }

    :active {
      transform: translateY(1px);
    }
  }

  :active {
    transform: translateY(1px);
  }
`;

export const VisibilityControls = styled(StackItem)`
  position: absolute;
  right: 0;
  top: 11px;
`;

export const MinimizeButton = styled.span`
  display: inline-block;
  width: 24px;
  height: 24px;
  position: relative;
  margin-left: 4px;
  top: -1px;
  border-radius: 3px 0 0 3px;
  background-color: #edeeee;

  &:hover {
    cursor: pointer;
    background-color: #e3e4e4;
  }

  .minimized & {
    right: 340px;
  }
`;

export const MinimizeIcon = styled(Icon)`
  position: relative;
  top: 3px;
  left: 9px;

  .minimized & {
    transform: rotate(180deg) translate(1px, -4px);
    top: 0;
  }
`;

export const HorizontalRule = styled.hr`
  border: none;
  border-top: 1px dotted rgba(0, 14, 14, 0.1);
  margin: 0 16px;
`;

export const H3 = styled.h3`
  margin-bottom: 0;
  padding: 16px 16px 8px;
  position: relative;
`;

export const Status = styled.span`
  display: inline-block;
  width: 4px;
  height: 36px;
  position: absolute;
  left: 0;
  top: 12px;
`;

export const CTAContainer = styled.div`
  padding: 0 16px 16px;

  :empty {
    padding: 0 16px 8px;
  }
`;

export const CTALink = styled.a`
  display: inline-block;
  margin-right: 18px;
  color: #007e8a;
  transition: transform 0.1s ease-out;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  &:last-child {
    margin-right: 0px;
  }

  .ic-Icon {
    margin-right: 4px;
    position: relative;
  }
`;

export const ChartContainer = styled.div`
  padding: 2px 6px;
  border-radius: 50px;
  font-size: 10px;

  .negative {
    color: #bf0016;
    background-color: #fcf2f3;
  }
`;
