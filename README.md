# Check Modified Content Links Validity Action
This GitHub action checks the validity of the links in the modified content for a pull request. If there are invalid links in the added content, the output of the GitHub action should be false, and the pull request will be closed. Meanwhile, the invalid links are commented in the closed pull request so contributers can be notified about the invalid links. This action should be triggered by pull_request_target event, which means it can serve as an early-check before manual merging. Notice that we only check the links which start with **http://** and **https://**.


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
