import { IconButton } from "@mui/joy";
import { uniqBy } from "lodash-es";
import { useContext } from "react";
import toast from "react-hot-toast";
import showCreateMemoRelationDialog from "@/components/CreateMemoRelationDialog";
import Icon from "@/components/Icon";
import { UNKNOWN_ID } from "@/helpers/consts";
import { useMemoStore } from "@/store/v1";
import { MemoRelation_Type } from "@/types/proto/api/v2/memo_relation_service";
import { EditorRefActions } from "../Editor";
import { MemoEditorContext } from "../types";

interface Props {
  editorRef: React.RefObject<EditorRefActions>;
}

const AddMemoRelationButton = (props: Props) => {
  const { editorRef } = props;
  const memoStore = useMemoStore();
  const context = useContext(MemoEditorContext);

  const handleAddMemoRelationBtnClick = () => {
    showCreateMemoRelationDialog({
      onConfirm: (memoIdList, embedded) => {
        // If embedded mode is enabled, embed the memo instead of creating a relation.
        if (embedded) {
          if (!editorRef.current) {
            toast.error("Failed to embed memo");
            return;
          }

          const cursorPosition = editorRef.current.getCursorPosition();
          const prevValue = editorRef.current.getContent().slice(0, cursorPosition);
          if (prevValue !== "" && !prevValue.endsWith("\n")) {
            editorRef.current.insertText("\n");
          }
          for (const memoId of memoIdList) {
            const memo = memoStore.getMemoById(memoId);
            editorRef.current.insertText(`![[memos/${memo.name}]]\n`);
          }
          setTimeout(() => {
            editorRef.current?.scrollToCursor();
            editorRef.current?.focus();
          });
          return;
        }

        context.setRelationList(
          uniqBy(
            [
              ...memoIdList.map((id) => ({ memoId: context.memoId || UNKNOWN_ID, relatedMemoId: id, type: MemoRelation_Type.REFERENCE })),
              ...context.relationList,
            ].filter((relation) => relation.relatedMemoId !== (context.memoId || UNKNOWN_ID)),
            "relatedMemoId",
          ),
        );
      },
    });
  };

  return (
    <IconButton size="sm" onClick={handleAddMemoRelationBtnClick}>
      <Icon.Link className="w-5 h-5 mx-auto" />
    </IconButton>
  );
};

export default AddMemoRelationButton;
