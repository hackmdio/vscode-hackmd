import { TreeItem } from 'react-vsc-treeview';

export const ErrorListItem = ({ error }: { error: any }) => {
  return (
    <>
      {error && (
        <TreeItem
          command={{
            command: 'HackMD.apiKey',
            title: 'Reset API Key',
            tooltip: 'Reset API Key',
          }}
          label="Check your API Endpoint config in settings or click here to reset API key"
        />
      )}
    </>
  );
};
