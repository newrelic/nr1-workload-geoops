import styled from 'styled-components';

export const DetailPanelContainer = styled.div`
  height: 100%;
  background-color: #fff;

  .ic-Icon {
    line-height: 10px;
  }
`;

export const ChildrenContainer = styled.div`
  height: 100%;
  padding: 16px;

  & > [class*='wnd-Tabs'] {
    margin: -16px;
    height: 100%;

    & > [class*='wnd-Tabs-pane'] {
      height: 100%;
    }
  }

  [class*='Tabs-navigation'] {
    margin-bottom: 0;
    background: #fafbfb;
    box-shadow: inset 0px 1px 0px #edeeee, inset 0px -1px 0px #edeeee;
    border-bottom: 0;
    padding: 0 8px;
  }

  [class*='Tab-label'] {
    font-size: 12px;
    padding: 9px 0;
  }

  [class*='TabContent'] {
    box-shadow: inset 0 2px 0 #fafbfb;
    height: calc(100% - 243px);
    overflow: scroll;
    padding: 16px;
  }

  [class*='TabContent'].entity-summary-tab {
    padding: 8px 16px;
  }
`;
