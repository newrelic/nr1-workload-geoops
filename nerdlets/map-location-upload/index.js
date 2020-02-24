import React from 'react';

import { NerdletStateContext, navigation } from 'nr1';
import { EmptyState } from '@newrelic/nr1-community';

import MapLocationFilesUpload from '../geo-ops-nerdlet/MapLocationFilesUpload';

export default class MapLocationUploadNerdlet extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      files: []
    };

    this.fileInput = React.createRef();
  }

  componentDidMount() {
    // Warning from Google Chrome about this:
    // File chooser dialog can only be shown with a user activation.
    // WompWomp
    // setTimeout(() => this.fileInput.current.click(), 300);
  }

  /*
    File: {
      name: "map-location-upload-file.json"
      lastModified: 1582219355387
      lastModifiedDate: Thu Feb 20 2020 12:22:35 GMT-0500 (Eastern Standard Time) {}
      webkitRelativePath: ""
      size: 90
      type: "application/json"
    }
  */
  fileInputOnChange(event) {
    const fileList = event.target.files;
    this.setState({ files: Array.from(fileList) });
  }

  closeFileUploadNerdlet({ mapGuid, accountId }) {
    navigation.openLauncher(
      {
        id: '40e251de-1278-49dd-9ce0-9a09006e79f4.geo-ops',
        nerdlet: {
          id: '40e251de-1278-49dd-9ce0-9a09006e79f4.geo-ops-nerdlet',
          urlState: {
            accountId,
            mapGuid,
            reload: true
          }
        }
      },
      { replaceHistory: true }
    );
  }

  render() {
    const { files } = this.state;

    return (
      <>
        <h4>File Upload</h4>
        <p>
          JSON file formatted to <a href="#">this specification</a>. We
          recommend this method for providing locations.
        </p>
        <input
          ref={this.fileInput}
          type="file"
          className="json-file-upload"
          accept=".json"
          onChange={event => {
            this.fileInputOnChange(event);
          }}
          onClick={event => {
            event.target.value = null;
          }}
        />
        <NerdletStateContext.Consumer>
          {nerdletState => {
            const { map: mapGuid, accountId } = nerdletState;

            // TO DO - if we don't have these, because of weird user navigation - show inputs to capture these
            // console.log(mapGuid);
            // console.log(accountId);

            if (!mapGuid || !accountId) {
              return <EmptyState />;
            }

            return (
              <>
                {files && (
                  <MapLocationFilesUpload
                    accountId={accountId}
                    mapGuid={mapGuid}
                    files={files}
                    onAddFileMapLocations={this.onAddFileMapLocations}
                    onClose={() =>
                      this.closeFileUploadNerdlet({ mapGuid, accountId })
                    }
                  />
                )}
              </>
            );
          }}
        </NerdletStateContext.Consumer>
      </>
    );
  }
}
