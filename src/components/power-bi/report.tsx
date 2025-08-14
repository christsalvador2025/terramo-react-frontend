interface PowerBIReportProps {
    title: string;
    url: string;
    height?: string;
  }
  
  const PowerBIReport = ({
    title,
    url,
  }: PowerBIReportProps) => {
    return (
      <iframe
        style={{
          minWidth: "400px",
          maxWidth: "calc (100vw - 160px)",
          width: "100%",
          aspectRatio: "16/9",
        }}
        title={title}
        src={url}
        allowFullScreen
      />
    );
  };
  
  export default PowerBIReport;
  