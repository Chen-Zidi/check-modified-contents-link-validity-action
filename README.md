# Check Modified Content Links Validity Action
The action checks the validity of the links in the modified content. If there are invalid links, the output of the action should be false, and the pull
request should be closed. The invalid links are commented in the closed pull request. This action should be triggered by pull_request_target event. We only check the links which start with http and https.


## Inputs

### no inputs required

## Outputs

### `validity`

The links in the modified content are valid or not.

## Example usage

```yaml
uses: Chen-Zidi/check-modified-contents-link-validity-action@main
```
You can print the output "validity" like this:
```yaml
- name: check validity
      uses: Chen-Zidi/check-modified-contents-link-validity-action@main
      id: check-validity
- name: print validity result
      run: echo "validity - ${{ steps.check-validity.outputs.validity}}"
```
