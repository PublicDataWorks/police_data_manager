import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  CardContent,
  Divider,
  Typography,
  withStyles
} from "@material-ui/core";
import DetailsCard from "../shared/components/DetailsCard";
import LinkButton from "../shared/components/LinkButton";
import styles from "../cases/CaseDetails/caseDetailsStyles";
import DetailsCardDisplay from "../shared/components/DetailsCard/DetailsCardDisplay";
import SignatureDialog from "./SignatureDialog";

const Signatures = props => {
  const [signers, setSigners] = useState([]);
  const [signatures, setSignatures] = useState({});
  const [signerDialog, setSignerDialog] = useState(); // undefined: dialog dormant, "new": add new signer, {stuff}: edit existing signer
  const [loadSigners, setLoadSigners] = useState(true);

  useEffect(() => {
    if (loadSigners) {
      axios
        .get("/api/signers")
        .then(result => {
          setSigners(result.data);
          result.data.forEach(processSigner);
        })
        .catch(error => {
          console.error(error);
        });

      setLoadSigners(false);
    }
  }, [loadSigners]);

  const processSigner = signer => {
    if (signer?.links.length) {
      const signatureLink = signer.links.find(link => link.rel === "signature");
      if (signatureLink) {
        retrieveSignature(signatureLink, signer.id);
      }
    }
  };

  const retrieveSignature = (signatureLink, signerId) => {
    axios
      .get(signatureLink.href)
      .then(result => {
        setSignatures(previousSignatures => ({
          ...previousSignatures,
          [signerId]: result.data
        }));
      })
      .catch(error => {
        console.error(error);
      });
  };

  return (
    <section style={{ margin: "10px 3px" }}>
      <DetailsCard title="Signatures">
        <CardContent style={{ padding: "0" }}>
          {signers.length ? (
            signers.map(signer => (
              <React.Fragment key={signer.id}>
                <section
                  className={props.classes.detailsLastRow}
                  style={{ padding: "5px 30px" }}
                >
                  <DetailsCardDisplay caption="Name" message={signer.name} />
                  <DetailsCardDisplay caption="Role" message={signer.title} />
                  <DetailsCardDisplay
                    caption="Phone Number"
                    message={signer.phone}
                  />
                  <DetailsCardDisplay caption="Signature">
                    {signatures[signer.id] ? (
                      <img
                        alt={`The signature of ${signer.name}`}
                        src={`data:image/png;base64,${signatures[signer.id]}`}
                        style={{ height: "4.5em" }}
                      />
                    ) : (
                      ""
                    )}
                  </DetailsCardDisplay>
                </section>
                <Divider />
              </React.Fragment>
            ))
          ) : (
            <Typography style={{ margin: "16px 24px" }}>
              No Signatures have been added
            </Typography>
          )}
          <LinkButton
            style={{
              marginLeft: "8px",
              marginTop: "8px",
              marginBottom: "8px"
            }}
            onClick={() => setSignerDialog("new")}
            data-testid="addSignature"
          >
            + Add Signature
          </LinkButton>
        </CardContent>
      </DetailsCard>
      {signerDialog === "new" ? (
        <SignatureDialog
          classes={{}}
          exit={isThereNewData => {
            if (isThereNewData) {
              setLoadSigners(true);
            }
            setSignerDialog(undefined);
          }}
          signers={signers}
        />
      ) : (
        ""
      )}
    </section>
  );
};

export default withStyles(styles, { withTheme: true })(Signatures);
