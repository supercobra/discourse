import Controller from "@ember/controller";
import { action } from "@ember/object";
import { isEmpty } from "@ember/utils";
import discourseComputed from "discourse-common/utils/decorators";
import { cookAsync } from "discourse/lib/text";
import ModalFunctionality from "discourse/mixins/modal-functionality";

export default Controller.extend(ModalFunctionality, {
  post: null,
  resolve: null,
  reject: null,

  notice: null,
  saving: false,

  @discourseComputed("saving", "notice")
  disabled(saving, notice) {
    return saving || isEmpty(notice);
  },

  onShow() {
    this.setProperties({ notice: "", saving: false });
  },

  onClose() {
    if (this.reject) {
      this.reject();
    }
  },

  @action
  setNotice(notice) {
    const { resolve, reject } = this;
    this.setProperties({ saving: true, resolve: null, reject: null });

    this.model
      .updatePostField("notice", notice)
      .then(() => {
        if (notice) {
          return cookAsync(notice, { features: { onebox: false } });
        }
      })
      .then((cooked) =>
        this.model.set(
          "notice",
          cooked
            ? {
                type: "custom",
                raw: notice,
                cooked: cooked.string,
              }
            : null
        )
      )
      .then(resolve, reject)
      .finally(() => this.send("closeModal"));
  },
});
