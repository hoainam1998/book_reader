import { JSX, useCallback, useState } from 'react';
import { AxiosResponse } from 'axios';
import { useLoaderData, useParams, useNavigate } from 'react-router-dom';
import { Op } from 'quill/core';
import Grid, { GridItem } from 'components/grid/grid';
import Input from 'components/form/form-control/input/input';
import Form from 'components/form/form';
import FileDragDropUpload from 'components/file-drag-drop-upload/file-drag-drop-upload';
import { OptionPrototype } from 'components/form/form-control/form-control';
import Radio from 'components/form/form-control/radio/radio';
import Editor from 'components/editor/editor';
import useForm, { RuleType } from 'hooks/useForm';
import { required, matchPattern, maxLength } from 'hooks/useValidate';
import useComponentDidMount from 'hooks/useComponentDidMount';
import useSetTheLastNavigateName from 'hooks/useSetTheLastNavigateName';
import { showToast, convertBase64ToSingleFile, getJsonFileContent } from 'utils';
import { createAuthor, loadAuthorDetail, updateAuthor } from '../fetcher';
import constants from 'read-only-variables';
import { HaveLoadedFnType } from 'interfaces';
import path from 'router/paths';
import './style.scss';

type AuthorStateType = {
  name: string;
  sex: number;
  avatar: File | string;
  yearOfBirth: number;
  yearOfDead: number;
  story: string;
};

const state: AuthorStateType = {
  name: '',
  sex: 0,
  avatar: '',
  yearOfBirth: 0,
  yearOfDead: 0,
  story: ''
};

const rules: RuleType<AuthorStateType> = {
  name: { required, maxLength: maxLength(20) },
  sex: { required },
  avatar: { required },
  yearOfBirth: { required, matchPattern: matchPattern(/^[1-2][0-9]{3}$/) },
  yearOfDead: { required, matchPattern: matchPattern(/^[1-2][0-9]{3}$/) },
  story: { required }
};

const formId: string = 'author-form';

const sexOptions: OptionPrototype<number>[] = constants.SEX.map((label, index) => ({ label, value: index }));

function AuthorDetail(): JSX.Element  {
  const [jsonStory, setJsonStory] = useState<Promise<Op[]> | null>(null);
  const loaderData = useLoaderData() as AxiosResponse;
  const { id } = useParams();
  const navigate = useNavigate();
  const author = loaderData?.data;

  const {
    name,
    sex,
    avatar,
    yearOfBirth,
    yearOfDead,
    story,
    handleSubmit,
    validate,
    reset
  } = useForm<AuthorStateType, RuleType<AuthorStateType>>(state, rules, formId);

  const onSubmit = useCallback((formData: FormData): void => {
    handleSubmit();

    const handlePromiseMutationAuthor = (promise: Promise<AxiosResponse>, toastTitle: string): void => {
      promise.then((res) => {
        showToast(toastTitle, res.data.message);
        setTimeout(() => {
          navigate(`${path.HOME}/${path.AUTHOR}`);
        }, 200);
      })
      .catch((error) => showToast(toastTitle, error.response.data.message));
    };

    if (!validate.error) {
      if (id) {
        formData.append('authorId', id);
        handlePromiseMutationAuthor(updateAuthor(formData), 'Update author');
      } else {
        handlePromiseMutationAuthor(createAuthor(formData), 'Create author');
      }
    }
  }, [validate]);

  useSetTheLastNavigateName(author?.name);

  useComponentDidMount((haveFetched: HaveLoadedFnType) => {
    return () => {
      if (author) {
        name.watch(author.name);
        sex.watch(author.sex);
        yearOfBirth.watch(author.yearOfBirth);
        yearOfDead.watch(author.yearOfDead);
        convertBase64ToSingleFile(author.avatar, author.name)
          .then(image => avatar.watch(image));
        if (!haveFetched()) {
          setJsonStory(getJsonFileContent(author.storyFile.json));
        }
      }
      return reset;
    };
  }, [author]);

  return (
    <Form id={formId} className="author-form" submitLabel="Save" onSubmit={onSubmit}>
      <Grid style={{ gap: 25 }}>
        <GridItem lg={3} md={4} sm={12}>
          <Input {...name} name="name" label="Name"
            labelColumnSize={{
              lg: 2
            }}
            inputColumnSize={{
              lg: 10
            }} />
        </GridItem>
        <GridItem lg={2} md={4} sm={12}>
          <Radio {...sex} label="Sex" name="sex" horizontal options={sexOptions}
            labelColumnSize={{
              lg: 4
            }}
            inputColumnSize={{
              lg: 8
            }} />
        </GridItem>
        <GridItem lg={2} md={4} sm={12}
          style={{
            md: {
              gridRow: 2
            }
          }}>
          <Input {...yearOfBirth} label="Year of birth" name="yearOfBirth"
            labelColumnSize={{
              lg: 5
            }}
            inputColumnSize={{
              lg: 7
            }} />
        </GridItem>
        <GridItem lg={2} md={4} sm={12}
          style={{
            md: {
              gridRow: 2
            }
          }}>
          <Input {...yearOfDead} label="Year of dead" name="yearOfDead"
            labelColumnSize={{
              lg: 5
            }}
            inputColumnSize={{
              lg: 7
            }} />
        </GridItem>
        <GridItem lg={3} md={4} sm={12}
          style={{
            md: {
              gridRow: 'span 2'
            }
          }}>
          <FileDragDropUpload {...avatar} name="avatar" label="Avatar" multiple={false}
            labelColumnSize={{
              lg: 12
            }}
            inputColumnSize={{
              lg: 12
            }} />
        </GridItem>
        <GridItem lg={12}>
          <Editor
            {...story}
            json={jsonStory}
            placeholder="Enter author story..."
            name="story"
            label="Story"
            className="editor-wrapper"
            inputColumnSize={{
              lg: 12
            }}
            labelColumnSize={{
              lg: 12
            }} />
        </GridItem>
      </Grid>
    </Form>
  );
}

export { loadAuthorDetail };
export default AuthorDetail;
