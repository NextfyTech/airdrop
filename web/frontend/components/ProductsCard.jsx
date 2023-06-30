import { useState } from "react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import { Table, Container, Nav } from 'react-bootstrap';
import cogoToast from 'cogo-toast';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
export function ProductsCard() {
  const [product, setProduct] = useState([]);
  const [loading, setLoad] = useState(false);
  const [show, setShow] = useState(false);
  const [token,setToken] = useState('');
  const [prdtId,setprdtId] = useState('');

  const handleClose = () => {
    setShow(false)
    setToken('')
  };
  const handleShow = (graphId) => {
    setprdtId(graphId)
    setShow(true)
    setToken('')
  };
  const fetch = useAuthenticatedFetch()
  const {
    data,
    refetch: refetchProductCount,
    isLoading: isLoadingCount,
    isRefetching: isRefetchingCount,
  } = useAppQuery({
    url: "/api/products/fetch",
    reactQueryOptions: {
      onSuccess: () => {
        setProduct(data.data);
        setLoad(true);
      },
    },
  });
  const handleProductUpdate = async () => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key: prdtId, newtoken : token }),
    };
    const isTagCreated = await fetch(`/api/product/update/tag/`, options)
    if (isTagCreated.status) {
      cogoToast.success("Product Updated Succesfully!")
    } else {
      cogoToast.warn("There is some error!")
    }
    setShow(false) 
    setToken('')
  }  
 
  // console.log(product)
 
  return ( 
    <> 
      {loading && (
        <Container fluid>
          <Nav className="justify-content-center" activeKey="/home">
            <Nav.Item>   
              <Nav.Link>
                <h2>Products Table</h2>
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <Table striped bordered hover className="container text-center" style={{ width: "80%", margin: "auto" }}>
            <thead style={{ padding: "2rem" }}>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Vendor</th> 
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {product.map((row, index) => {
                const arr = row.tags.split(",").map(item => item.trim());

                return (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>{row.title}</td>
                    <td>{row.vendor}</td>
                    <td>
                      <p style={{ cursor: "pointer" }} onClick={() => handleShow(row.admin_graphql_api_id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-2 h-6" style={{ width: "20px" }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Please enter your NFT Token</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <input type="text" className="form-control" value={token} onChange={() => setToken(event.target.value)} />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
              <Button variant="primary" onClick={() => handleProductUpdate()}>
                Save Changes
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      )}
    </>
  );
}