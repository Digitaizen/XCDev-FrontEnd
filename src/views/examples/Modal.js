import React, { useState } from "react";
// reactstrap components
import { Button, Modal } from "reactstrap";

const Modals = () => {
  const [exampleModal, setExampleModal] = useState(false);

  function toggleModal() {
    setExampleModal(true);
  }

  return (
    <>
      {/* Button trigger modal */}
      <Button
        color="primary"
        type="button"
        onClick={() => toggleModal("exampleModal")}
      >
        Launch demo modal
      </Button>
      {/* Modal */}
      <Modal
        className="modal-dialog-centered"
        isOpen={exampleModal}
        toggle={() => toggleModal("exampleModal")}
      >
        <div className="modal-header">
          <h5 className="modal-title" id="exampleModalLabel">
            Modal title
          </h5>
          <button
            aria-label="Close"
            className="close"
            data-dismiss="modal"
            type="button"
            onClick={() => toggleModal("exampleModal")}
          >
            <span aria-hidden={true}>×</span>
          </button>
        </div>
        <div className="modal-body">...</div>
        <div className="modal-footer">
          <Button
            color="secondary"
            data-dismiss="modal"
            type="button"
            onClick={() => toggleModal("exampleModal")}
          >
            Close
          </Button>
          <Button color="primary" type="button">
            Save changes
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default Modals;
