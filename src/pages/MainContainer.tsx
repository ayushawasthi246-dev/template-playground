import { useEffect } from "react";
import React from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import type { ImperativePanelHandle } from "react-resizable-panels";
import AgreementData from "../editors/editorsContainer/AgreementData";
import TemplateModel from "../editors/editorsContainer/TemplateModel";
import TemplateMarkdown from "../editors/editorsContainer/TemplateMarkdown";
import useAppStore from "../store/store";
import { AIChatPanel } from "../components/AIChatPanel";
import ProblemPanel from "../components/ProblemPanel";
import SampleDropdown from "../components/SampleDropdown";
import { useState, useRef } from "react";
import "../styles/pages/MainContainer.css";
import html2pdf from "html2pdf.js";
import { Button } from "antd";
import { MdExpandMore , MdExpandLess  } from "react-icons/md";
import { LuStretchHorizontal } from "react-icons/lu";
import { PiTabsBold } from "react-icons/pi";

const MainContainer = () => {
  const agreementHtml = useAppStore((state) => state.agreementHtml);
  const downloadRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const backgroundColor = useAppStore((state) => state.backgroundColor);
  const textColor = useAppStore((state) => state.textColor);

  const handleDownloadPdf = async () => {
    const element = downloadRef.current;
    if (!element) return;

    try {
      setIsDownloading(true);
      const options = {
        margin: 10,
        filename: 'agreement.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: true,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      } as const;

      await html2pdf().set(options).from(element).save();
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please check the console.");
    } finally {
      setIsDownloading(false);
    }
  }

  const {
    isAIChatOpen,
    isEditorsVisible,
    isPreviewVisible,
    isProblemPanelVisible,
    isModelCollapsed,
    isTemplateCollapsed,
    isDataCollapsed,
    toggleModelCollapse,
    toggleTemplateCollapse,
    toggleDataCollapse,
  } = useAppStore((state) => ({
    isAIChatOpen: state.isAIChatOpen,
    isEditorsVisible: state.isEditorsVisible,
    isPreviewVisible: state.isPreviewVisible,
    isProblemPanelVisible: state.isProblemPanelVisible,
    isModelCollapsed: state.isModelCollapsed,
    isTemplateCollapsed: state.isTemplateCollapsed,
    isDataCollapsed: state.isDataCollapsed,
    toggleModelCollapse: state.toggleModelCollapse,
    toggleTemplateCollapse: state.toggleTemplateCollapse,
    toggleDataCollapse: state.toggleDataCollapse,
  }));

  const [, setLoading] = useState(true);
  const [layout, setLayout] = useState<"vertical" | "tabs">("vertical");
  const [activeTab, setActiveTab] = useState("model");

  const modelPanelRef = useRef<ImperativePanelHandle>(null);
  const templatePanelRef = useRef<ImperativePanelHandle>(null);
  const dataPanelRef = useRef<ImperativePanelHandle>(null);

  const Panels = [
    {
    id: "model",
    title: "Concerto Model",
    ref: modelPanelRef,
    collapsed: isModelCollapsed,
    toggle: toggleModelCollapse,
    content: <TemplateModel />,
  },
  {
    id: "template",
    title: "TemplateMark",
    ref: templatePanelRef,
    collapsed: isTemplateCollapsed,
    toggle: toggleTemplateCollapse,
    content: <TemplateMarkdown />,
  },
  {
    id: "data",
    title: "JSON Data",
    ref: dataPanelRef,
    collapsed: isDataCollapsed,
    toggle: toggleDataCollapse,
    content: <AgreementData />,
  },
  ];

  const panelMap = {
  model: {
    ref: modelPanelRef,
    collapsed: isModelCollapsed
  },
  template: {
    ref: templatePanelRef,
    collapsed: isTemplateCollapsed
  },
  data: {
    ref: dataPanelRef,
    collapsed: isDataCollapsed
  },
  };

  const prevCollapsed = useRef({
    model: isModelCollapsed,
    template: isTemplateCollapsed,
    data: isDataCollapsed,
  }); 

  useEffect(() => {
    Object.entries(panelMap).forEach(([key, panel]) => {
      if (prevCollapsed.current[key] !== panel.collapsed) {
        panel.ref.current?.resize(panel.collapsed ? collapsedSize : expandedSize);
      }
    });

    // Update previous states
    prevCollapsed.current = {
      model: isModelCollapsed,
      template: isTemplateCollapsed,
      data: isDataCollapsed,
    };
  }, [isModelCollapsed, isTemplateCollapsed, isDataCollapsed]);

  const collapsedSize = 7; 
  const collapsedCount = [isModelCollapsed, isTemplateCollapsed, isDataCollapsed].filter(Boolean).length; 
  const expandedCount = 3 - collapsedCount; 
  const expandedSize = expandedCount > 0 ? (100 - (collapsedCount * collapsedSize)) / expandedCount : 33;
  const activePanel = Panels.find(p => p.id === activeTab);

  return (
    <div className="main-container" style={{ backgroundColor }}>
      <PanelGroup direction="horizontal" className="main-container-panel-group"
        style={{ position: "fixed", width: "calc(100% - 64px)", height: "calc(100% - 64px)" }}>
        {isEditorsVisible && (
          <>
            <Panel defaultSize={62.5} minSize={30}>
              <div className="main-container-editors-panel" style={{ backgroundColor }}>
                <div className=""
                style={{
                  height: 48,
                  padding: "0px 10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "5px solid #e5e7eb"
                }}
                >
                  <SampleDropdown setLoading={setLoading} />
                  <button
                  onClick={()=>setLayout(layout === "tabs" ? "vertical" : "tabs" )}
                  style={{
                    fontSize: 30,
                    color: "#216b9cff",
                    display: "flex",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer"
                  }}
                  title={layout === "tabs" ? "Vertical" : "Tab"}> 
                  {layout === "tabs" ? <LuStretchHorizontal /> : <PiTabsBold />}
                  </button>
                </div>
                
                <PanelGroup direction="vertical" className="main-container-editors-panel-group">

                  {layout === "vertical" &&
                    Panels.map((panel,index)=>(
                      <React.Fragment key={panel.id}>
                        <Panel ref={panel.ref} minSize={collapsedSize} maxSize={90}
                        >
                          <div className="main-container-editor-section tour-concerto-model" >
                            <div className={`main-container-editor-header 
                            ${backgroundColor === '#ffffff' ? 'main-container-editor-header-light' : 'main-container-editor-header-dark'}`}                      
                            >
                              <div 
                              className="main-container-editor-header-left"
                              style={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                              }}
                              >
                                <span>{panel.title}</span>
                                <button
                                  className="collapse-button"
                                  onClick={panel.toggle}
                                  style={{ 
                                    color: textColor, 
                                    background: 'transparent', 
                                    border: 'none', 
                                    cursor: 'pointer',
                                    fontSize: '25px',
                                  }}
                                  title={panel.collapsed ? "Expand" : "Collapse"}
                                >
                                  {panel.collapsed ?  <MdExpandMore /> : <MdExpandLess />}
                                </button>
                              </div>
                            </div>
                            <div className="main-container-editor-content"
                              style={{
                                backgroundColor,
                                opacity: panel.collapsed ? 0 : 1,
                                transition: "opacity 0.3s ease-in-out"
                              }}
                            >
                              {panel.content}
                            </div>
                          </div>
                        </Panel>
                        {index !== Panels.length - 1 && (
                            <PanelResizeHandle className="main-container-panel-resize-handle-vertical" />
                        )}                        
                      </React.Fragment>
                    ))
                  }
                  {layout === "tabs" && (
                    <React.Fragment>
                      <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        background: backgroundColor === '#ffffff' ? "#ffffffff" :"#375a72",
                        borderBottom: `solid ${backgroundColor === '#ffffff' ? '5px #e3eaf1' : '8px #374151'}`
                      }}>
                      {Panels.map((panel,index)=>{  
                      const dividerindex = activeTab === "model" ? 1 : activeTab === "data" ? 0 : null ;
                      return(
                        <React.Fragment key={panel.id}>
                          <button
                            className={`main-container-editors-tab ${activeTab === panel.id ? 
                              `${backgroundColor === '#ffffff' ? 'main-container-editor-header-light-selected' : 'main-container-editor-header-dark-selected'}` : 
                              `${backgroundColor === '#ffffff' ? 'main-container-editor-header-light-unselected' : 'main-container-editor-header-dark-unselected'}`}
                              }`}
                            onClick={() => setActiveTab(panel.id)}
                            style={{
                              padding: "15px 20px",
                              transition: "all 0.25s ease-in-out",
                              borderTopLeftRadius: activeTab === "model" ? "0px" : "15px"
                            }}
                          >{panel.title}</button>

                          {index === dividerindex && (
                            <span
                              style={{
                              display: "inline-block",
                              width: 2,
                              height: 15,
                              background: `${backgroundColor === '#ffffff' ? 'gray' : 'white'}`,
                            }}/>
                          )}
                        </React.Fragment>
                        )})}
                      </div> 
                      <Panel minSize={0} defaultSize={100} >
                        <div className="main-container-editor-section tour-template-mark">
                        <div className="main-container-editor-content"
                            style={{
                              backgroundColor,
                              opacity: isModelCollapsed ? 1 : 1,
                              transition: "opacity 0.3s ease-in-out"
                            }}
                          >
                            {activePanel?.content}
                          </div>
                        </div>
                      </Panel>
                    </React.Fragment>
                  )}

                  {isProblemPanelVisible && (
                    <>
                      <PanelResizeHandle className="main-container-panel-resize-handle-vertical" />
                      <Panel defaultSize={25} minSize={15}>
                        <ProblemPanel />
                      </Panel>
                    </>
                  )}


                </PanelGroup>
              </div>
            </Panel>
            <PanelResizeHandle className="main-container-panel-resize-handle-horizontal" />
          </>
        )}
        {isPreviewVisible && (
          <>
            <Panel defaultSize={37.5} minSize={20}>
              <div className="main-container-preview-panel tour-preview-panel" style={{ backgroundColor }}>
                <div className={`main-container-preview-header ${backgroundColor === '#ffffff' ? 'main-container-preview-header-light' : 'main-container-preview-header-dark'}`}>
                  <span>Preview</span>
                  <Button 
                    onClick={handleDownloadPdf}
                    loading={isDownloading} 
                    style={{ marginLeft: "10px" }}
                  >
                   Download PDF
                  </Button>
                </div>
                <div className="main-container-preview-content" style={{ backgroundColor }}>
                  <div className="main-container-preview-text">
                    <div
                      ref={downloadRef}
                      className="main-container-agreement"
                      dangerouslySetInnerHTML={{ __html: agreementHtml }}
                      style={{
                        color: textColor,
                        backgroundColor: backgroundColor,
                        padding: "20px"
                      }}
                    />
                  </div>
                </div>
              </div>
            </Panel>
            {/* <PanelResizeHandle className="main-container-panel-resize-handle-horizontal" /> */}
          </>
        )}
        {isAIChatOpen && (
          <>
            <Panel defaultSize={30} minSize={20}>
              <AIChatPanel />
            </Panel>
          </>
        )}
      </PanelGroup>
    </div>
  );
};

export default MainContainer;
