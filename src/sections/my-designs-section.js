import React from 'react';
import { observer } from 'mobx-react-lite';
import { useAuth0 } from '@auth0/auth0-react';
import { Button, Card, Menu, MenuItem, Position } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';

import { SectionTab } from 'polotno/side-panel';
import FaFolder from '@meronex/icons/fa/FaFolder';
import * as api from '../api';

import { useProject } from '../project';

const API = 'http://localhost:3001/api';

const DesignCard = observer(({ design, project, onDelete }) => {
  return (
    <Card
      style={{ margin: '3px', padding: '0px', position: 'relative' }}
      interactive
      onClick={() => {
        project.loadById(design.design_id);
      }}
    >
      <img src={design.preview} style={{ width: '100%' }} />
      <div
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          padding: '3px',
        }}
      >
        {design.name}
      </div>
      <div
        style={{ position: 'absolute', top: '5px', right: '5px' }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Popover2
          content={
            <Menu>
              {/* <MenuDivider title={t('toolbar.layering')} /> */}
              <MenuItem
                icon="document-open"
                text="Open"
                onClick={() => {
                  project.loadById(design.design_id);
                }}
              />
              <MenuItem
                icon="duplicate"
                text="Copy"
                onClick={() => {
                  project.duplicate();
                }}
              />
              <MenuItem
                icon="trash"
                text="Delete"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete it?')) {
                    api.deleteDesign({
                      id: design.design_id,
                      authToken: project.authToken,
                    });
                    onDelete(design.design_id);
                  }
                }}
              />
            </Menu>
          }
          position={Position.BOTTOM}
        >
          <Button icon="more" />
        </Popover2>
      </div>
    </Card>
  );
});

export const MyDesignsPanel = observer(({ store }) => {
  const {
    isAuthenticated,
    isLoading,
    loginWithPopup,
    getAccessTokenSilently,
    user,
    logout,
  } = useAuth0();

  const project = useProject();

  const [designsLoadings, setDesignsLoading] = React.useState(false);
  const [designs, setDesigns] = React.useState([]);

  const loadProjects = async () => {
    setDesignsLoading(true);
    const accessToken = await getAccessTokenSilently({});

    const req = await fetch(API + '/get-user-designs', {
      method: 'GET',
      headers: {
        Authorization: accessToken,
      },
    });
    const res = await req.json();
    setDesigns(res.data);
    setDesignsLoading(false);
  };

  const handleProjectDelete = (id) => {
    setDesigns(designs.filter((design) => design.design_id !== id));
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated, isLoading]);

  const half1 = [];
  const half2 = [];

  designs.forEach((design, index) => {
    if (index % 2 === 0) {
      half1.push(design);
    } else {
      half2.push(design);
    }
  });

  return (
    <div style={{ height: '100%' }}>
      {user && (
        <div
          style={{
            display: 'flex',
            paddingBottom: '5px',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ lineHeight: '30px' }}>Logged as {user.name}</div>
          <Button onClick={logout}>Logout</Button>
        </div>
      )}
      {!isAuthenticated && (
        <div>
          If you want to save your work into cloud storage you need to login.
          <Button fill intent="primary" onClick={loginWithPopup}>
            Ok, login
          </Button>
        </div>
      )}
      {designsLoadings && <div>Loading...</div>}
      {!designsLoadings && !designs.length && <div>No designs yet</div>}
      {!isLoading && isAuthenticated && (
        <div style={{ display: 'flex' }}>
          <div style={{ width: '50%' }}>
            {half1.map((design) => (
              <DesignCard
                design={design}
                key={design.design_id}
                store={store}
                project={project}
                onDelete={handleProjectDelete}
              />
            ))}
          </div>
          <div style={{ width: '50%' }}>
            {half2.map((design) => (
              <DesignCard
                design={design}
                key={design.design_id}
                store={store}
                project={project}
                onDelete={handleProjectDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

// define the new custom section
export const MyDesignsSection = {
  name: 'my-designs',
  Tab: (props) => (
    <SectionTab name="My Designs" {...props}>
      <FaFolder />
    </SectionTab>
  ),
  // we need observer to update component automatically on any store changes
  Panel: MyDesignsPanel,
};
