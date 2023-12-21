import { useContext, useState, useEffect } from "react";
import { Layout, Row, Col, Input, Select, Modal, Button, Image } from "antd";
import AdminLayout from "../../../components/layout/AdminLayout";
import Editor from "rich-markdown-editor";
import { ThemeContext } from "../../../context/theme";
import axios from "axios";
import { uploadImage } from "../../../functions/upload";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import { UploadOutlined } from "@ant-design/icons";
import Media from "../../../components/media";
import { MediaContext } from "../../../context/media";

const { Option } = Select;
const { Content, Sider } = Layout;

function EditPost() {
  // context
  const [theme, setTheme] = useContext(ThemeContext);
  const [media, setMedia] = useContext(MediaContext);
  // state
  const [postId, setPostId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState([]); // post's existing categories
  const [loadedCategories, setLoadedCategories] = useState([]);
  const [featuredImage, setFeaturedImage] = useState({});
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  // media Modal
  // const [visibleMedia, setVisibleMedia] = useState(false);
  // hook
  const router = useRouter();

  useEffect(() => {
    loadPost();
  }, [router?.query?.slug]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadPost = async () => {
    try {
      const { data } = await axios.get(`/post/${router.query.slug}`);
      console.log("GOT POST FOR EDIT", data);
      setTitle(data.title);
      setContent(data.content);
      setFeaturedImage(data.featured_image);
      setPostId(data._id);
      // push category names
      let arr = [];
      data.categories.map((c) => arr.push(c.name));
      setCategories(arr);
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  const loadCategories = async () => {
    try {
      const { data } = await axios.get("/categories");
      setLoadedCategories(data);
    } catch (err) {
      console.log(err);
    }
  };

  const handlePublish = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(`/edit-post/${postId}`, {
        title,
        content,
        categories,
        featuredImage: media?.selected?._id
          ? media?.selected?._id
          : featuredImage?._id
          ? featuredImage._id
          : undefined,
      });
      if (data?.error) {
        toast.error(data?.error);
        setLoading(false);
      } else {
        // console.log("POST PUBLISHED RES => ", data);
        toast.success("Post created successfully");
        localStorage.removeItem("post-title");
        localStorage.removeItem("post-content");
        setMedia({ ...media, selected: "" });
        router.push("/admin/posts");
      }
    } catch (err) {
      console.log(err);
      toast.error("Post create failed. Try again.");
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Row>
        <Col span={14} offset={1}>
          <h1>Edit post</h1>
          <Input
            size="large"
            value={title}
            placeholder="Give your post a title"
            onChange={(e) => {
              setTitle(e.target.value);
              localStorage.setItem(
                "post-title",
                JSON.stringify(e.target.value)
              );
            }}
          />
          <br />
          <br />
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="editor-scroll">
              <Editor
                dark={theme === "light" ? false : true}
                defaultValue={content}
                onChange={(v) => {
                  setContent(v());
                  localStorage.setItem("post-content", JSON.stringify(v()));
                }}
                uploadImage={uploadImage}
              />
            </div>
          )}

          <br />
          <br />

          {/* <pre>{JSON.stringify(loadedCategories, null, 4)}</pre> */}
        </Col>

        <Col span={6} offset={1}>
          <Button
            style={{ margin: "10px 0px 10px 0px", width: "100%" }}
            onClick={() => setVisible(true)}
          >
            Preview
          </Button>

          <Button
            style={{ margin: "10px 0px 10px 0px", width: "100%" }}
            onClick={() => setMedia({ ...media, showMediaModal: true })}
          >
            <UploadOutlined /> Featured Image
          </Button>

          <h4>Categories</h4>

          <Select
            mode="multiple"
            allowClear={true}
            placeholder="Select categories"
            style={{ width: "100%" }}
            onChange={(v) => setCategories(v)}
            value={[...categories]}
          >
            {loadedCategories.map((item) => (
              <Option key={item.name}>{item.name}</Option>
            ))}
          </Select>

          {media?.selected && (
            <div style={{ marginTop: "15px" }}>
              <Image width="100%" src={media?.selected?.url} />
            </div>
          )}

          <Button
            loading={loading}
            style={{ margin: "10px 0px 10px 0px", width: "100%" }}
            type="primary"
            onClick={handlePublish}
          >
            Publish
          </Button>
        </Col>
        {/* preview modal */}
        <Modal
          title="Preview"
          centered
          visible={visible}
          onOk={() => setVisible(false)}
          onCancel={() => setVisible(false)}
          width={720}
          footer={null}
        >
          <h1>{title}</h1>
          <Editor
            dark={theme === "light" ? false : true}
            defaultValue={content}
            readOnly={true}
          />
        </Modal>
        {/* media modal */}
        <Modal
          visible={media.showMediaModal}
          title="Media"
          onOk={() => setMedia({ ...media, showMediaModal: false })}
          onCancel={() => setMedia({ ...media, showMediaModal: false })}
          width={720}
          footer={null}
        >
          <Media />
        </Modal>
      </Row>
    </AdminLayout>
  );
}

export default EditPost;
